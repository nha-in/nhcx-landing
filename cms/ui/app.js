/**
 * The CMS's browser half.
 *
 * The content files have no schema, so neither does this: it walks whatever
 * JSON the server sends and draws a widget per value. That is what keeps the
 * editor honest as the site's content changes shape - a new field in
 * content/news.json turns up here without anyone touching the CMS.
 *
 * Editing is done on a deep copy. Nothing reaches the server until Save, and
 * the server sends back the file's new modification time so the next save can
 * still detect someone else's edit.
 *
 * No framework and no build step: one script, plain DOM.
 */
const $ = (sel) => document.querySelector(sel);

/**
 * Where this CMS is mounted: `/` when it is served directly, `/cms/` behind
 * nginx. Every request is made relative to it, so the same files work at
 * either address without the server knowing which one it is.
 */
const BASE = new URL('.', location.href).pathname;

const state = {
  tab: null, // doc name, or '__theme__'
  docs: [],
  data: null, // the document being edited
  mtime: 0,
  dirty: false,
  theme: null,
};

const THEME_TAB = '__theme__';

// ---------------------------------------------------------------------------
// server

async function api(path, options = {}) {
  const res = await fetch(BASE + path.replace(/^\//, ''), {
    headers: { 'Content-Type': 'application/json' },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const text = await res.text();
  const payload = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(payload.error || `${res.status} ${res.statusText}`);
  return payload;
}

function toast(message, kind = '') {
  const el = $('#toast');
  el.textContent = message;
  el.dataset.kind = kind;
  el.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => {
    el.hidden = true;
  }, kind === 'error' ? 7000 : 2600);
}

// ---------------------------------------------------------------------------
// helpers

const titleCase = (key) =>
  key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/^./, (c) => c.toUpperCase());

/** A label for one entry of a list: whatever it calls itself. */
function itemLabel(value, index) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    for (const key of ['title', 'label', 'name', 'question', 'heading', 'version', 'when', 'date']) {
      if (typeof value[key] === 'string' && value[key].trim()) return value[key];
    }
    const first = Object.values(value).find((v) => typeof v === 'string' && v.trim());
    if (first) return first;
  }
  if (typeof value === 'string' && value.trim()) return value;
  return `Item ${index + 1}`;
}

/** What an empty new entry in this list should look like. */
function blankLike(list) {
  const model = list.find((v) => v && typeof v === 'object' && !Array.isArray(v));
  if (!model) return typeof list[0] === 'number' ? 0 : '';
  const blank = {};
  for (const [key, value] of Object.entries(model)) {
    if (Array.isArray(value)) blank[key] = [];
    else if (value && typeof value === 'object') blank[key] = {};
    else if (typeof value === 'number') blank[key] = 0;
    else if (typeof value === 'boolean') blank[key] = false;
    else blank[key] = '';
  }
  return blank;
}

function markDirty() {
  state.dirty = true;
  $('#dirty').hidden = false;
  $('#save').disabled = false;
}

// ---------------------------------------------------------------------------
// the tree editor

/** Draws `value` at `key` of `parent`, writing edits straight back into it. */
function renderValue(parent, key, path) {
  const value = parent[key];

  if (Array.isArray(value)) return renderList(parent, key, path);
  if (value && typeof value === 'object') return renderObject(value, path, titleCase(String(key)));

  const row = document.createElement('div');
  row.className = 'row';
  const id = `f${path.replace(/\W/g, '_')}`;
  const label = document.createElement('label');
  label.htmlFor = id;
  label.textContent = titleCase(String(key));
  const hint = document.createElement('span');
  hint.className = 'path';
  hint.textContent = path;
  label.append(hint);
  row.append(label);

  let field;
  if (typeof value === 'boolean') {
    field = document.createElement('input');
    field.type = 'checkbox';
    field.checked = value;
    field.addEventListener('change', () => {
      parent[key] = field.checked;
      markDirty();
    });
  } else if (typeof value === 'number') {
    field = document.createElement('input');
    field.type = 'number';
    field.value = String(value);
    field.addEventListener('input', () => {
      parent[key] = field.value === '' ? 0 : Number(field.value);
      markDirty();
    });
  } else {
    const text = value == null ? '' : String(value);
    const long = text.length > 80 || text.includes('\n');
    field = document.createElement(long ? 'textarea' : 'input');
    if (!long) field.type = 'text';
    field.value = text;
    if (long) field.rows = Math.min(14, Math.max(3, text.split('\n').length + 1));
    field.addEventListener('input', () => {
      parent[key] = field.value;
      markDirty();
    });
  }
  field.id = id;
  row.append(field);
  return row;
}

function renderObject(object, path, title) {
  const keys = Object.keys(object);
  const details = document.createElement('details');
  details.className = 'group';
  details.open = path.split('.').length <= 1;
  const summary = document.createElement('summary');
  summary.textContent = title;
  const count = document.createElement('span');
  count.className = 'count';
  count.textContent = `${keys.length} field${keys.length === 1 ? '' : 's'}`;
  summary.append(count);
  details.append(summary);

  const body = document.createElement('div');
  body.className = 'body';
  const rows = document.createElement('div');
  rows.className = 'node-rows';
  for (const key of keys) {
    if (key.startsWith('_')) continue; // editor notes in the file itself
    rows.append(renderValue(object, key, path ? `${path}.${key}` : key));
  }
  body.append(rows);
  details.append(body);
  return details;
}

function renderList(parent, key, path) {
  const list = parent[key];
  const details = document.createElement('details');
  details.className = 'group';
  details.open = path.split('.').length <= 1;
  const summary = document.createElement('summary');
  summary.textContent = titleCase(String(key));
  const count = document.createElement('span');
  count.className = 'count';
  summary.append(count);
  details.append(summary);

  const body = document.createElement('div');
  body.className = 'body';
  details.append(body);

  const draw = () => {
    body.textContent = '';
    count.textContent = `${list.length} item${list.length === 1 ? '' : 's'}`;
    list.forEach((entry, index) => {
      const item = document.createElement('div');
      item.className = 'item';

      const head = document.createElement('div');
      head.className = 'item-head';
      const title = document.createElement('span');
      title.className = 'title';
      title.textContent = `${index + 1}. ${itemLabel(entry, index)}`;
      head.append(title);

      const up = document.createElement('button');
      up.type = 'button';
      up.textContent = '↑';
      up.title = 'Move up';
      up.disabled = index === 0;
      up.addEventListener('click', () => {
        [list[index - 1], list[index]] = [list[index], list[index - 1]];
        markDirty();
        draw();
      });

      const down = document.createElement('button');
      down.type = 'button';
      down.textContent = '↓';
      down.title = 'Move down';
      down.disabled = index === list.length - 1;
      down.addEventListener('click', () => {
        [list[index + 1], list[index]] = [list[index], list[index + 1]];
        markDirty();
        draw();
      });

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'danger';
      remove.textContent = 'Remove';
      remove.addEventListener('click', () => {
        if (!confirm(`Remove "${itemLabel(entry, index)}"?`)) return;
        list.splice(index, 1);
        markDirty();
        draw();
      });

      head.append(up, down, remove);
      item.append(head);

      const inner = document.createElement('div');
      inner.className = 'item-body';
      if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
        const rows = document.createElement('div');
        rows.className = 'node-rows';
        for (const field of Object.keys(entry)) {
          if (field.startsWith('_')) continue;
          rows.append(renderValue(entry, field, `${path}[${index}].${field}`));
        }
        inner.append(rows);
      } else {
        inner.append(renderValue(list, index, `${path}[${index}]`));
      }
      item.append(inner);
      body.append(item);
    });

    const add = document.createElement('button');
    add.type = 'button';
    add.className = 'add';
    add.textContent = 'Add item';
    add.addEventListener('click', () => {
      list.push(blankLike(list));
      markDirty();
      draw();
      body.lastElementChild.previousElementSibling?.scrollIntoView({ block: 'center' });
    });
    body.append(add);
  };

  draw();
  return details;
}

// ---------------------------------------------------------------------------
// tabs

function renderTabs() {
  const nav = $('#tabs');
  nav.textContent = '';
  const tabs = [...state.docs.map((d) => [d.name, d.title]), [THEME_TAB, 'Theme']];
  for (const [name, title] of tabs) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = title;
    button.setAttribute('aria-selected', String(name === state.tab));
    button.addEventListener('click', () => openTab(name));
    nav.append(button);
  }
}

async function openTab(name) {
  if (state.dirty && !confirm('You have unsaved changes. Leave them behind?')) return;
  state.tab = name;
  state.dirty = false;
  $('#dirty').hidden = true;
  $('#save').disabled = true;
  renderTabs();

  const editor = $('#editor');
  editor.textContent = 'Loading…';

  if (name === THEME_TAB) {
    const theme = await api('/api/theme');
    state.theme = theme;
    state.mtime = theme.mtime;
    $('#blurb').textContent =
      'The design tokens at the top of styles/globals.css. Every colour, corner and font on the site reads from these, so a change here moves the whole site at once.';
    editor.textContent = '';
    for (const group of theme.groups) editor.append(renderThemeGroup(group));
    return;
  }

  const doc = await api(`/api/doc?name=${encodeURIComponent(name)}`);
  state.data = doc.data;
  state.mtime = doc.mtime;
  $('#blurb').textContent = doc.blurb;
  editor.textContent = '';
  const rows = document.createElement('div');
  rows.className = 'node-rows';
  for (const key of Object.keys(doc.data)) {
    if (key.startsWith('_')) continue;
    rows.append(renderValue(doc.data, key, key));
  }
  editor.append(rows);
}

function renderThemeGroup(group) {
  const details = document.createElement('details');
  details.className = 'group';
  details.open = true;
  const summary = document.createElement('summary');
  summary.textContent = group.title;
  details.append(summary);
  const body = document.createElement('div');
  body.className = 'body';
  const grid = document.createElement('div');
  grid.className = 'theme-grid';

  for (const token of group.tokens) {
    const row = document.createElement('div');
    row.className = 'row';
    const label = document.createElement('label');
    label.textContent = token.label;
    const hint = document.createElement('span');
    hint.className = 'path';
    hint.textContent = token.name;
    label.append(hint);
    row.append(label);

    const swatch = document.createElement('div');
    swatch.className = 'swatch';
    const isColour = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(token.value);
    const text = document.createElement('input');
    text.type = 'text';
    text.value = token.value;

    if (isColour) {
      const picker = document.createElement('input');
      picker.type = 'color';
      picker.value = token.value.length === 4
        ? '#' + token.value.slice(1).split('').map((c) => c + c).join('')
        : token.value;
      picker.addEventListener('input', () => {
        text.value = picker.value;
        token.value = picker.value;
        markDirty();
      });
      swatch.append(picker);
    }
    text.addEventListener('input', () => {
      token.value = text.value;
      markDirty();
    });
    swatch.append(text);
    row.append(swatch);
    grid.append(row);
  }

  body.append(grid);
  details.append(body);
  return details;
}

// ---------------------------------------------------------------------------
// save and publish

async function save() {
  $('#save').disabled = true;
  try {
    if (state.tab === THEME_TAB) {
      const values = {};
      for (const group of state.theme.groups) for (const t of group.tokens) values[t.name] = t.value;
      const out = await api('/api/theme', { method: 'PUT', body: { values, mtime: state.mtime } });
      state.mtime = out.mtime;
    } else {
      const out = await api('/api/doc', {
        method: 'PUT',
        body: { name: state.tab, data: state.data, mtime: state.mtime },
      });
      state.mtime = out.mtime;
    }
    state.dirty = false;
    $('#dirty').hidden = true;
    toast('Saved. Publish to put it on the site.', 'ok');
  } catch (err) {
    $('#save').disabled = false;
    toast(err.message, 'error');
  }
}

let pollTimer = null;

async function publish() {
  $('#log').hidden = false;
  $('#log-body').textContent = 'Starting…';
  try {
    await api('/api/build', { method: 'POST' });
  } catch (err) {
    toast(err.message, 'error');
    return;
  }
  clearInterval(pollTimer);
  pollTimer = setInterval(async () => {
    const status = await api('/api/build');
    const body = $('#log-body');
    body.textContent = status.log.join('\n');
    body.scrollTop = body.scrollHeight;
    $('#publish').disabled = status.running;
    if (!status.running) {
      clearInterval(pollTimer);
      toast(status.code === 0 ? 'Published.' : `Build failed (exit ${status.code}).`,
            status.code === 0 ? 'ok' : 'error');
    }
  }, 900);
}

// ---------------------------------------------------------------------------
// start

async function start() {
  const session = await api('/api/session');
  if (!session.authorised) {
    $('#login').hidden = false;
    $('#login-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      try {
        await api('/api/login', { method: 'POST', body: { password: $('#password').value } });
        location.reload();
      } catch (err) {
        const box = $('#login-error');
        box.textContent = err.message;
        box.hidden = false;
      }
    });
    return;
  }

  $('#app').hidden = false;
  const { docs } = await api('/api/docs');
  state.docs = docs;
  await openTab(docs[0].name);

  $('#save').addEventListener('click', save);
  $('#publish').addEventListener('click', publish);
  $('#log-close').addEventListener('click', () => {
    $('#log').hidden = true;
  });
  document.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 's') {
      event.preventDefault();
      if (state.dirty) save();
    }
  });
  window.addEventListener('beforeunload', (event) => {
    if (state.dirty) event.preventDefault();
  });
}

start().catch((err) => {
  document.body.textContent = `Could not start: ${err.message}`;
});
