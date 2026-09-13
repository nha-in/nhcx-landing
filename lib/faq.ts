/*
 * The questions and answers, in the order they are shown. The first four
 * are the general ones the home page shows; the rest were collected from
 * the previous landing page's content (web/landing-old, content/site.yaml)
 * and are grouped by topic on the FAQ page. `more` is an optional link
 * shown under an answer.
 */

export type FaqItem = { topic: string; q: string; a: string; more?: string };

export const FAQ_ITEMS: FaqItem[] = [
  {
    topic: "General",
    q: "What is NHCX?",
    a: "NHCX (National Health Claims Exchange) is a platform developed under the Ayushman Bharat Digital Mission (ABDM) to streamline and standardise the exchange of health-claim information between healthcare providers and payers. It enables digitised, machine-readable information to move between different systems using common standards.",
    more: "/docs/",
  },
  {
    topic: "General",
    q: "Who can use NHCX?",
    a: "Hospitals, nursing homes and diagnostic centres on the provider side; insurers, TPAs, state health agencies and government schemes on the payer side; and the solution vendors who build for them.",
    more: "/docs/",
  },
  {
    topic: "General",
    q: "How does NHCX make claim processing easier?",
    a: "Claims travel as structured FHIR bundles instead of PDFs and images, so a payer’s system can read them without re-typing, and both sides see the same status at every step.",
    more: "/docs/",
  },
  {
    topic: "General",
    q: "What standards does NHCX use?",
    a: "HL7 FHIR R4 for the clinical and financial content, the HCX protocol for the exchange envelope, and ABDM identifiers for participants and patients.",
    more: "/docs/",
  },
  {
    topic: "Onboarding",
    q: "Who should onboard to the sandbox?",
    a: "Any hospital, insurer, TPA, government scheme or software vendor building health-claim exchange capability. The sandbox exists so each participant can test its own components against the communication standards and get certified before touching production.",
  },
  {
    topic: "Onboarding",
    q: "What happens after I submit the application?",
    a: "Applications are verified against the details in the form: a semi-manual step, so expect review latency rather than instant provisioning. Duplicate requests from one participant, participants not registered with any registry, TSPs without a valid website and spam are filtered out. Approved participants are added to the sandbox and issued credentials; follow your application on the Status page.",
  },
  {
    topic: "Onboarding",
    q: "Which registry ID do I use?",
    a: "Providers use the HFR ID generated during ABDM integration. Payers and TPAs use the IRDAI (or respective authority) ID with leading zeros stripped: 0123 is passed as 123. End-user applications may use their client ID. An entity can hold several participant IDs, one per linked HFR ID.",
  },
  {
    topic: "Onboarding",
    q: "What are the role and registry codes, and do they differ between sandbox and production?",
    a: "They are the same in both. Roles: PROVIDER 10001, PAYER 10002, AGENCY_TPA 10003, EUA 10009. Registries: HFR/EUA 10001, PAYER/TPA 10004. Note that 10001 means PROVIDER as a role and HFR/EUA as a registry: different enums in different fields. Wrong mapping causes access issues, rejections or misrouting.",
  },
  {
    topic: "Onboarding",
    q: "Can I test without a real payer or provider partner?",
    a: "Yes. The sandbox provides a dummy payer, participant 1000003538@hcx, for insurance plan, coverage eligibility, pre-auth, claim, payment notice and communication. You drive its answer yourself (Approve, Reject or Query) through a control endpoint that does not exist in production, so remove it from your code before go-live.",
  },
  {
    topic: "Tokens and access",
    q: "How do I get a session token, and how long does it last?",
    a: "Exchange the client_id and client_secret issued at onboarding for a bearer token with an OAuth 2.0 client-credentials call to /get/session. The token lives 1200 seconds (20 minutes): cache it, refresh it well inside that window and never log it. Sandbox tokens do not work against production and vice versa.",
  },
  {
    topic: "Tokens and access",
    q: "Why do I get 401 Unauthorized?",
    a: "Three usual causes: the token was sent without the Bearer prefix; it has expired: “Sender is not authorized to execute the operation” is the expiry message, so renew via the session API; or it was minted for the other environment. On a 401 discard the cached token, mint a new one and replay once; a second 401 means the credentials themselves are wrong.",
  },
  {
    topic: "Encryption",
    q: "How is the payload protected on the wire?",
    a: "Every request body is a JWE in compact serialization: RSA-OAEP-256 wraps the content key with the recipient’s public certificate and A256GCM encrypts the FHIR bundle. The x-hcx-* routing headers sit in the protected header, so the gateway routes without reading clinical content: the payload is unreadable even to NHCX.",
  },
  {
    topic: "Encryption",
    q: "Where does the recipient’s certificate come from, and do I sign the payload as well?",
    a: "Fetch it from the registry with /fetch/certs and cache it for 24 hours. No separate signature is needed: JWE’s authenticated encryption (AEAD) already protects the integrity of the ciphertext and the protected header. Rotate your own encryption key yearly and report any compromise at once.",
  },
  {
    topic: "Callbacks",
    q: "Is any transaction synchronous?",
    a: "No. The gateway never returns a business decision on the same connection. A submission is acknowledged with HTTP 202 and the answer arrives later as a separate inbound call to your on_ endpoint: /preauth/submit is answered on /preauth/on_submit. Every participant is therefore also an HTTP server.",
  },
  {
    topic: "Callbacks",
    q: "What must my callback endpoint return?",
    a: "HTTP 202 Accepted with the acceptance body, within 30 seconds. Anything else (a 200, a malformed body, an adjudication holding the socket) is treated as an error: the gateway retries the same message up to five times and then deletes the correlation ID. Acknowledge first, adjudicate after, and be idempotent on x-hcx-correlation_id.",
  },
  {
    topic: "Callbacks",
    q: "My callback never arrives. What do I check?",
    a: "In order: the callback URL uses a domain name, not an IP address or port; the server is India-based; the NHCX NAT addresses 3.109.99.210, 13.126.152.0 and 13.200.129.223 are whitelisted; the firewall is not dropping them; and the request is not being misrouted inside your own gateway or load balancer.",
  },
  {
    topic: "Callbacks",
    q: "What is the v1/error API, and do I have to implement it?",
    a: "Yes, every integrator must. It is the sender-side endpoint that receives reject details when a message never reached its recipient or the recipient failed to handle it. Without it a request that died at the gateway looks, from the hospital desk, identical to one still under review.",
  },
  {
    topic: "Correlation and headers",
    q: "What is the difference between api_call_id, request_id and correlation_id?",
    a: "All three are 36-character UUIDs. x-hcx-api_call_id is new on every single call; x-hcx-request_id is new per request payload; x-hcx-correlation_id is constant for the whole conversation and is what responders copy back, so persist it against your case before you post. After five failed deliveries the correlation ID is dead: start a fresh cycle with a new one.",
  },
  {
    topic: "Correlation and headers",
    q: "Which timestamp format does x-hcx-timestamp take?",
    a: "The published sources disagree: the PMJAY handbook shows an IST ISO-8601 value (2026-03-19T11:46:34+05:30) and warns that other zones fail validation, while the integrator FAQ gives a zero-UTC form (2024-05-20T11:29:27.358Z). Validate against the environment you are integrating with rather than assuming; the documentation records both.",
  },
  {
    topic: "Correlation and headers",
    q: "Which recipient code do I put in the header?",
    a: "The registry participant code, namespaced as code@hcx. For a payer take the processingID from the get/policies response, not the PayerID field, which is one of the most common integration mistakes. Your own code goes in x-hcx-sender_code.",
  },
  {
    topic: "Error codes",
    q: "What is the difference between NHCX-* and PAYR-* error codes?",
    a: "NHCX-* codes are raised by the exchange gateway: the headers, registration or transport are wrong and the payer never saw the request. PAYR-* codes come from the payer side, either the bridge that validates FHIR or the adjudication engine. PAYR numbers are reused across sheets with different meanings, so match on the description string and log both.",
  },
  {
    topic: "Error codes",
    q: "What does NHCX-1006 “Duplicate request” mean?",
    a: "A message with the same correlation ID already exists in the gateway. Correlation IDs are unique per request cycle: reuse one (including after a failed cycle) and the gateway rejects it. Mint a new UUID and resubmit.",
  },
  {
    topic: "Certification and go-live",
    q: "What does certification actually get me?",
    a: "A successful-completion certificate from the sandbox, valid for a configured period, issued after your functional and security test results are reviewed. That certificate is what the production onboarding review asks for; depending on policy the sandbox may also require STQC or CERT-IN review.",
  },
  {
    topic: "Certification and go-live",
    q: "What is tested at sandbox exit?",
    a: "A fixed use-case list: 13 for providers (registry lookups, session, eligibility, insurance plan, pre-auth, communication, claim, search, payment-notice acknowledgement, task, status) and 15 for payers. Every payload must validate against the NRCeS profiles, responses must carry the right correlation and receiver codes, and rejections use a ProtocolResponse.",
  },
  {
    topic: "Certification and go-live",
    q: "What changes when I go live?",
    a: "The gateway base URL, the credentials, the certificates you encrypt against (re-fetch from production) and the counterparty: the dummy payer, its control endpoints and the test provider and policy IDs must be removed. Bundles, headers and encryption stay the same. PMJAY-NHCX is a separate track with extra scheme configuration.",
  },
];

/** The items grouped by topic, in first-seen order. */
export function faqTopics(items: FaqItem[] = FAQ_ITEMS): Array<{ topic: string; items: FaqItem[] }> {
  const groups: Array<{ topic: string; items: FaqItem[] }> = [];
  for (const item of items) {
    const group = groups.find((g) => g.topic === item.topic);
    if (group) group.items.push(item);
    else groups.push({ topic: item.topic, items: [item] });
  }
  return groups;
}
