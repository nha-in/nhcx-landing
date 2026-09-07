#!/usr/bin/env python3
"""A small CMS for this site.

The landing site is a static export whose every word lives in a handful of
JSON files under `content/`, and whose look lives in the custom properties at
the top of `styles/globals.css`. This edits both, in a browser, without anyone
having to open an editor or know JSON. Nothing the site renders is written in
a component: a heading, a tagline or a description changes here and nowhere
else.

    python3 cms/app.py                 # http://127.0.0.1:8100
    NHCX_CMS_PASSWORD=… python3 cms/app.py --host 0.0.0.0 --port 8100

Nothing is installed: standard library only, one process, no database. What
makes it safe to hand to someone else is the write path, not the size:

  * every save is validated as JSON and checked against a small contract
    (`CONTRACT`) before it is allowed anywhere near the file;
  * the previous version is copied into `cms/backups/` first, so any save can
    be undone by hand, and the last 40 are kept;
  * the write is atomic (write a temporary file, then rename), so a crash or a
    full disk cannot leave a half-written file the site would fail to build;
  * a save carries the modification time the editor loaded, and is refused if
    the file changed underneath it, so two people cannot silently overwrite
    each other.

Publishing runs `npm run build` in the site root and streams the log back, so
the person editing can see what happened rather than guessing.

Set NHCX_CMS_PASSWORD to require a password. Without it the server refuses to
bind to anything but the loopback address: an unauthenticated CMS should not
be reachable from another machine.
"""
from __future__ import annotations

import argparse
import hmac
import json
import os
import re
import secrets
import shutil
import subprocess
import threading
import time
from datetime import datetime, timezone
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content"
UI = Path(__file__).resolve().parent / "ui"
BACKUPS = Path(__file__).resolve().parent / "backups"
GLOBALS_CSS = ROOT / "styles" / "globals.css"

KEEP_BACKUPS = 40
PASSWORD = os.environ.get("NHCX_CMS_PASSWORD", "").strip()

# ---------------------------------------------------------------------------
# what may be edited


class Doc:
    """One editable JSON file, and the shape it must keep."""

    def __init__(self, name: str, title: str, blurb: str, contract: dict[str, type] | None = None):
        self.name = name
        self.title = title
        self.blurb = blurb
        self.contract = contract or {}

    @property
    def path(self) -> Path:
        return CONTENT / self.name

    def validate(self, data: object) -> None:
        if not isinstance(data, dict):
            raise ValueError("the document must be a JSON object")
        for key, kind in self.contract.items():
            if key not in data:
                raise ValueError(f'"{key}" is required and is missing')
            if not isinstance(data[key], kind):
                want = "a list" if kind is list else "an object"
                raise ValueError(f'"{key}" must be {want}')


DOCS: list[Doc] = [
    Doc(
        "fallback.json",
        "Site content",
        "Everything the CMS-driven pages say: the navigation and footer, the landing sections, "
        "the DevTools and apply pages.",
        {"global": dict, "pages": dict, "collections": dict},
    ),
    Doc(
        "site.json",
        "Page copy",
        "Every word of the pages that are designed rather than assembled in the CMS: the landing "
        "sections, PM-JAY, DevTools and the AI skill page, plus the footer's contact block.",
        {"chrome": dict, "home": dict, "pmjay": dict, "devtools": dict, "skill": dict},
    ),
    Doc("news.json", "News", "The news page and its feed.", {"page": dict, "items": list}),
    Doc("videos.json", "Videos", "The videos page and its library.", {"page": dict, "videos": list}),
    Doc(
        "download.json",
        "Downloads",
        "The groups and files listed on the downloads page. A file item points at a path under "
        "public/files/; a url item points anywhere.",
        {"groups": list},
    ),
]
DOCS_BY_NAME = {d.name: d for d in DOCS}

# Only these token groups are offered: the rest of :root is spacing and motion
# that the design depends on.
THEME_GROUPS: list[tuple[str, list[tuple[str, str]]]] = [
    (
        "Brand",
        [
            ("--primary", "Primary"),
            ("--primary-2", "Primary hover"),
            ("--primary-3", "Primary deep"),
            ("--primary-tint", "Primary tint"),
            ("--primary-line", "Primary line"),
            ("--primary-soft", "Primary on dark"),
        ],
    ),
    (
        "Text",
        [("--ink", "Ink"), ("--ink-2", "Ink 2"), ("--ink-3", "Ink 3"), ("--ink-4", "Ink 4")],
    ),
    (
        "Surfaces",
        [
            ("--ground", "Page"),
            ("--ground-2", "Raised"),
            ("--ground-3", "Sunken"),
            ("--line", "Line"),
            ("--line-2", "Line 2"),
        ],
    ),
    (
        "Dark bands",
        [("--navy", "Navy"), ("--navy-2", "Navy deep"), ("--navy-3", "Navy panel")],
    ),
    (
        "Accents",
        [
            ("--saffron", "Saffron"),
            ("--peach", "Peach tint"),
            ("--peach-2", "Peach deep"),
            ("--green", "Green"),
            ("--green-tint", "Green tint"),
            ("--amber", "Amber"),
            ("--amber-tint", "Amber tint"),
            ("--red", "Red"),
            ("--red-tint", "Red tint"),
        ],
    ),
    (
        "Shape and type",
        [
            ("--radius", "Corner radius"),
            ("--radius-lg", "Corner radius, large"),
            ("--container", "Container width"),
            ("--measure", "Reading measure"),
            ("--sans", "Body font"),
            ("--mono", "Mono font"),
        ],
    ),
]
THEME_TOKENS = {name for _, tokens in THEME_GROUPS for name, _ in tokens}

# ---------------------------------------------------------------------------
# files


def read_doc(doc: Doc) -> dict:
    raw = doc.path.read_text(encoding="utf-8") if doc.path.exists() else "{}"
    return {
        "name": doc.name,
        "title": doc.title,
        "blurb": doc.blurb,
        "data": json.loads(raw),
        "mtime": doc.path.stat().st_mtime if doc.path.exists() else 0,
    }


def back_up(path: Path) -> None:
    if not path.exists():
        return
    BACKUPS.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    shutil.copy2(path, BACKUPS / f"{path.stem}.{stamp}{path.suffix}")
    kept = sorted(BACKUPS.glob(f"{path.stem}.*{path.suffix}"))
    for old in kept[:-KEEP_BACKUPS]:
        old.unlink(missing_ok=True)


def write_atomic(path: Path, text: str) -> float:
    """Write through a temporary file in the same directory, then rename."""
    tmp = path.with_name(f".{path.name}.tmp{os.getpid()}")
    tmp.write_text(text, encoding="utf-8")
    os.replace(tmp, path)
    return path.stat().st_mtime


def save_doc(doc: Doc, data: object, mtime: float | None) -> float:
    doc.validate(data)
    if doc.path.exists() and mtime is not None:
        current = doc.path.stat().st_mtime
        # A second of slack: some filesystems round mtimes.
        if abs(current - mtime) > 1:
            raise Conflict(
                f"{doc.name} changed on disk after you loaded it. Reload the page and redo this edit."
            )
    back_up(doc.path)
    return write_atomic(doc.path, json.dumps(data, indent=2, ensure_ascii=False) + "\n")


class Conflict(Exception):
    pass


# ---------------------------------------------------------------------------
# theme tokens, read from and written back into the :root block

ROOT_BLOCK = re.compile(r"(:root\s*\{)(.*?)(\n\})", re.S)
DECL = re.compile(r"(--[\w-]+)\s*:\s*([^;}]+);")


def read_theme() -> dict:
    css = GLOBALS_CSS.read_text(encoding="utf-8")
    block = ROOT_BLOCK.search(css)
    values = dict(DECL.findall(block.group(2))) if block else {}
    groups = []
    for title, tokens in THEME_GROUPS:
        rows = [
            {"name": name, "label": label, "value": values.get(name, "").strip()}
            for name, label in tokens
            if name in values
        ]
        if rows:
            groups.append({"title": title, "tokens": rows})
    return {"groups": groups, "mtime": GLOBALS_CSS.stat().st_mtime}


def save_theme(values: dict[str, str], mtime: float | None) -> float:
    current = GLOBALS_CSS.stat().st_mtime
    if mtime is not None and abs(current - mtime) > 1:
        raise Conflict("styles/globals.css changed on disk after you loaded it. Reload and redo this edit.")
    css = GLOBALS_CSS.read_text(encoding="utf-8")
    block = ROOT_BLOCK.search(css)
    if not block:
        raise ValueError("no :root block found in styles/globals.css")

    def swap(m: re.Match[str]) -> str:
        name = m.group(1)
        if name in values and name in THEME_TOKENS:
            new = str(values[name]).strip()
            if not new or ";" in new or "}" in new or "\n" in new:
                raise ValueError(f"{name}: not a usable value")
            return f"{name}: {new};"
        return m.group(0)

    body = DECL.sub(swap, block.group(2))
    css = css[: block.start(2)] + body + css[block.end(2) :]
    back_up(GLOBALS_CSS)
    return write_atomic(GLOBALS_CSS, css)


# ---------------------------------------------------------------------------
# publishing


class Build:
    """One `npm run build`, run in the background so the page stays alive."""

    def __init__(self) -> None:
        self.lock = threading.Lock()
        self.running = False
        self.started_at = 0.0
        self.finished_at = 0.0
        self.code: int | None = None
        self.log: list[str] = []

    def start(self) -> bool:
        with self.lock:
            if self.running:
                return False
            self.running = True
            self.started_at = time.time()
            self.finished_at = 0.0
            self.code = None
            self.log = ["$ npm run build"]
        threading.Thread(target=self._run, daemon=True).start()
        return True

    def _run(self) -> None:
        try:
            proc = subprocess.Popen(
                ["npm", "run", "build"],
                cwd=ROOT,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1,
            )
            assert proc.stdout is not None
            for line in proc.stdout:
                with self.lock:
                    self.log.append(line.rstrip("\n"))
                    del self.log[:-400]
            code = proc.wait()
        except Exception as err:  # npm missing, permissions, anything
            with self.lock:
                self.log.append(f"failed to run npm: {err}")
            code = 127
        with self.lock:
            self.running = False
            self.code = code
            self.finished_at = time.time()

    def status(self) -> dict:
        with self.lock:
            return {
                "running": self.running,
                "code": self.code,
                "log": list(self.log),
                "startedAt": self.started_at,
                "finishedAt": self.finished_at,
            }


BUILD = Build()

# ---------------------------------------------------------------------------
# sessions

SESSIONS: set[str] = set()


def authorised(handler: "Handler") -> bool:
    if not PASSWORD:
        return True
    cookie = handler.headers.get("Cookie", "")
    for part in cookie.split(";"):
        name, _, value = part.strip().partition("=")
        if name == "cms_session" and value in SESSIONS:
            return True
    return False


# ---------------------------------------------------------------------------
# the server

CONTENT_TYPES = {".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
                 ".css": "text/css; charset=utf-8"}


class Handler(BaseHTTPRequestHandler):
    server_version = "nhcx-cms"

    def log_message(self, fmt: str, *args) -> None:  # quieter than the default
        print(f"cms {self.address_string()} {fmt % args}")

    # -- helpers ----------------------------------------------------------
    def send_json(self, payload: object, status: int = 200) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def send_error_json(self, status: int, message: str) -> None:
        self.send_json({"error": message}, status)

    def body_json(self) -> dict:
        length = int(self.headers.get("Content-Length") or 0)
        if length <= 0:
            return {}
        if length > 8 * 1024 * 1024:
            raise ValueError("that document is too large to be site content")
        return json.loads(self.rfile.read(length).decode("utf-8"))

    def send_file(self, path: Path) -> None:
        if not path.is_file():
            self.send_error_json(HTTPStatus.NOT_FOUND, "not found")
            return
        body = path.read_bytes()
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", CONTENT_TYPES.get(path.suffix, "application/octet-stream"))
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    # -- routes -----------------------------------------------------------
    def do_GET(self) -> None:  # noqa: N802 - http.server's interface
        route = urlparse(self.path)
        path = route.path

        if path in ("/", "/index.html"):
            self.send_file(UI / "index.html")
            return
        if path in ("/app.js", "/app.css"):
            self.send_file(UI / path.lstrip("/"))
            return
        if path == "/favicon.ico":
            self.send_response(HTTPStatus.NO_CONTENT)
            self.end_headers()
            return

        if path == "/api/session":
            self.send_json({"authorised": authorised(self), "needsPassword": bool(PASSWORD)})
            return

        if not authorised(self):
            self.send_error_json(HTTPStatus.UNAUTHORIZED, "sign in first")
            return

        if path == "/api/docs":
            self.send_json(
                {
                    "docs": [{"name": d.name, "title": d.title, "blurb": d.blurb} for d in DOCS],
                    "root": str(ROOT),
                }
            )
            return
        if path == "/api/doc":
            name = (parse_qs(route.query).get("name") or [""])[0]
            doc = DOCS_BY_NAME.get(name)
            if not doc:
                self.send_error_json(HTTPStatus.NOT_FOUND, "no such document")
                return
            try:
                self.send_json(read_doc(doc))
            except json.JSONDecodeError as err:
                self.send_error_json(HTTPStatus.CONFLICT, f"{name} is not valid JSON: {err}")
            return
        if path == "/api/theme":
            self.send_json(read_theme())
            return
        if path == "/api/build":
            self.send_json(BUILD.status())
            return

        self.send_error_json(HTTPStatus.NOT_FOUND, "not found")

    def do_POST(self) -> None:  # noqa: N802
        path = urlparse(self.path).path

        if path == "/api/login":
            try:
                given = str(self.body_json().get("password", ""))
            except ValueError:
                self.send_error_json(HTTPStatus.BAD_REQUEST, "bad request")
                return
            if not PASSWORD or not hmac.compare_digest(given, PASSWORD):
                time.sleep(0.5)  # a small tax on guessing
                self.send_error_json(HTTPStatus.UNAUTHORIZED, "wrong password")
                return
            token = secrets.token_urlsafe(32)
            SESSIONS.add(token)
            self.send_response(HTTPStatus.OK)
            self.send_header("Content-Type", "application/json")
            self.send_header("Set-Cookie", f"cms_session={token}; HttpOnly; SameSite=Strict; Path=/")
            self.end_headers()
            self.wfile.write(b'{"ok":true}')
            return

        if not authorised(self):
            self.send_error_json(HTTPStatus.UNAUTHORIZED, "sign in first")
            return

        if path == "/api/build":
            started = BUILD.start()
            self.send_json({"started": started, **BUILD.status()})
            return

        self.send_error_json(HTTPStatus.NOT_FOUND, "not found")

    def do_PUT(self) -> None:  # noqa: N802
        path = urlparse(self.path).path
        if not authorised(self):
            self.send_error_json(HTTPStatus.UNAUTHORIZED, "sign in first")
            return
        try:
            payload = self.body_json()
        except (ValueError, json.JSONDecodeError) as err:
            self.send_error_json(HTTPStatus.BAD_REQUEST, str(err))
            return

        try:
            if path == "/api/doc":
                doc = DOCS_BY_NAME.get(str(payload.get("name", "")))
                if not doc:
                    self.send_error_json(HTTPStatus.NOT_FOUND, "no such document")
                    return
                mtime = save_doc(doc, payload.get("data"), payload.get("mtime"))
                self.send_json({"ok": True, "mtime": mtime})
                return
            if path == "/api/theme":
                values = payload.get("values") or {}
                if not isinstance(values, dict):
                    raise ValueError("values must be an object")
                mtime = save_theme(values, payload.get("mtime"))
                self.send_json({"ok": True, "mtime": mtime})
                return
        except Conflict as err:
            self.send_error_json(HTTPStatus.CONFLICT, str(err))
            return
        except ValueError as err:
            self.send_error_json(HTTPStatus.UNPROCESSABLE_ENTITY, str(err))
            return

        self.send_error_json(HTTPStatus.NOT_FOUND, "not found")


def main() -> None:
    parser = argparse.ArgumentParser(description="Edit this site's content and theme in a browser.")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8100)
    args = parser.parse_args()

    if args.host not in ("127.0.0.1", "localhost", "::1") and not PASSWORD:
        raise SystemExit(
            "Refusing to listen on "
            f"{args.host} without a password. Set NHCX_CMS_PASSWORD, or bind to 127.0.0.1."
        )
    for doc in DOCS:
        if not doc.path.exists():
            print(f"cms: note: content/{doc.name} does not exist yet; it will be created on save")

    server = ThreadingHTTPServer((args.host, args.port), Handler)
    print(f"cms: editing {ROOT}")
    print(f"cms: http://{args.host}:{args.port}/  ({'password required' if PASSWORD else 'no password set'})")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\ncms: stopped")


if __name__ == "__main__":
    main()
