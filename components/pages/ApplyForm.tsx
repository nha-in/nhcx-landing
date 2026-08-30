'use client';

import { useMemo, useState } from 'react';
import type { ApplyPage } from '@/lib/content';
import { CmsUnreachableError, submitApplication, type ApplicationDraft } from '@/lib/cms-client';
import { withBase } from '@/lib/paths';

type EntityType = ApplicationDraft['entityType'];
type Role = ApplicationDraft['role'];

const ROLES: Array<{ key: Role; label: string; note: string }> = [
  { key: 'provider', label: 'Provider', note: 'Hospital, clinic or diagnostic centre sending claims' },
  { key: 'payer', label: 'Payer', note: 'Insurer or government scheme adjudicating claims' },
  { key: 'tpa', label: 'TPA', note: 'Third-party administrator acting for one or more payers' },
  { key: 'hmis_vendor', label: 'HMIS / software vendor', note: 'Building the integration on behalf of providers or payers' },
  { key: 'other', label: 'Other', note: 'Researcher, regulator or ecosystem partner' },
];

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_FILES = 5;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^[+\d][\d\s-]{7,17}$/;

const EMPTY: ApplicationDraft = {
  entityType: 'company_llp_firm',
  organisationName: '',
  registrationNumber: '',
  address: '',
  contactName: '',
  email: '',
  phone: '',
  designation: '',
  role: 'provider',
  useCases: [],
  sandboxObjective: '',
  website: '',
};

function validate(d: ApplicationDraft, files: File[], consent: boolean): Record<string, string> {
  const errors: Record<string, string> = {};
  const company = d.entityType === 'company_llp_firm';
  if (!d.organisationName.trim()) {
    errors.organisationName = company ? 'Enter the registered name of the company, LLP or firm.' : 'Enter your name or the proprietorship name.';
  }
  if (!d.registrationNumber.trim()) {
    errors.registrationNumber = company ? 'Enter the CIN or LLPIN.' : 'Enter the PAN.';
  } else if (company && !/^[A-Z0-9-]{6,21}$/i.test(d.registrationNumber.trim())) {
    errors.registrationNumber = 'A CIN is 21 characters and an LLPIN 7–8; check the value.';
  } else if (!company && !/^[A-Z]{5}[0-9]{4}[A-Z]$/i.test(d.registrationNumber.trim())) {
    errors.registrationNumber = 'A PAN looks like ABCDE1234F.';
  }
  if (!d.address.trim()) errors.address = 'Enter the registered address.';
  if (!d.contactName.trim()) errors.contactName = 'Enter the name of the person we should contact.';
  if (!EMAIL.test(d.email.trim())) errors.email = 'Enter a valid email address — it is used to track the application.';
  if (!PHONE.test(d.phone.trim())) errors.phone = 'Enter a phone number with country code, e.g. +91 98765 43210.';
  if (company && !d.designation.trim()) errors.designation = 'Enter the contact person’s designation.';
  if (d.useCases.length === 0) errors.useCases = 'Pick at least one use case you intend to test.';
  if (d.sandboxObjective.trim().length < 40) errors.sandboxObjective = 'Describe the objective in a sentence or two (at least 40 characters).';
  if (files.length > MAX_FILES) errors.documents = `Attach up to ${MAX_FILES} files.`;
  for (const f of files) {
    if (f.size > MAX_FILE_BYTES) errors.documents = `${f.name} is over 10 MB.`;
  }
  if (!consent) errors.consent = 'Please confirm the declaration to submit.';
  return errors;
}

export default function ApplyForm({ page }: { page: ApplyPage }) {
  const useCaseOptions = useMemo(
    () => (Array.isArray(page.useCaseOptions) ? (page.useCaseOptions as string[]) : []),
    [page.useCaseOptions],
  );
  const [draft, setDraft] = useState<ApplicationDraft>(EMPTY);
  const [files, setFiles] = useState<File[]>([]);
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [done, setDone] = useState<{ applicationId: string | null } | null>(null);

  const company = draft.entityType === 'company_llp_firm';
  const set = <K extends keyof ApplicationDraft>(key: K, value: ApplicationDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const toggleUseCase = (uc: string) =>
    set('useCases', draft.useCases.includes(uc) ? draft.useCases.filter((u) => u !== uc) : [...draft.useCases, uc]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFailure(null);
    const found = validate(draft, files, consent);
    setErrors(found);
    if (Object.keys(found).length) {
      document.getElementById(`field-${Object.keys(found)[0]}`)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return;
    }
    // Bots fill every field; people never see this one.
    if (draft.website.trim()) {
      setDone({ applicationId: null });
      return;
    }
    setBusy(true);
    try {
      const result = await submitApplication(draft, files);
      setDone({ applicationId: result.applicationId });
    } catch (err) {
      setFailure(err instanceof CmsUnreachableError ? (page.errorText ?? err.message) : (err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="ap-card ap-success" role="status">
        <span className="pill-badge">{page.successTitle ?? 'Application received'}</span>
        {done.applicationId ? (
          <>
            <span className="ap-success-id">{done.applicationId}</span>
            <p>{page.successText}</p>
            <div className="doc-ctas">
              <a href={withBase('/documentation/')} className="btn btn-md btn-primary">
                Read the documentation
              </a>
              <a href={withBase('/devtools/')} className="btn btn-md btn-secondary">
                Set up the DevTools console
              </a>
            </div>
          </>
        ) : (
          <p>Thank you. Your application has been recorded.</p>
        )}
      </div>
    );
  }

  const field = (key: keyof ApplicationDraft | 'documents' | 'consent') =>
    errors[key] ? <span className="ap-error" id={`error-${key}`}>{errors[key]}</span> : null;

  return (
    <form className="ap-card" onSubmit={onSubmit} noValidate>
      <fieldset className="ap-fieldset">
        <legend>Applicant type</legend>
        <div className="ap-switch" role="radiogroup" aria-label="Applicant type">
          {(
            [
              ['company_llp_firm', 'Company, LLP or firm'],
              ['individual_proprietorship', 'Individual or proprietorship'],
            ] as Array<[EntityType, string]>
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={draft.entityType === key}
              className={`db-tab${draft.entityType === key ? ' on' : ''}`}
              onClick={() => set('entityType', key)}
            >
              {label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="ap-fieldset">
        <legend>{company ? 'Organisation' : 'Applicant'}</legend>
        <div className="ap-grid">
          <label className="ap-field" id="field-organisationName">
            <span>{company ? 'Registered name' : 'Full name or proprietorship name'}</span>
            <input value={draft.organisationName} onChange={(e) => set('organisationName', e.target.value)} autoComplete="organization" />
            {field('organisationName')}
          </label>
          <label className="ap-field" id="field-registrationNumber">
            <span>{company ? 'CIN or LLPIN' : 'PAN'}</span>
            <input
              value={draft.registrationNumber}
              onChange={(e) => set('registrationNumber', e.target.value.toUpperCase())}
              placeholder={company ? 'U85100DL2020PTC123456 or AAB-1234' : 'ABCDE1234F'}
            />
            {field('registrationNumber')}
          </label>
          <label className="ap-field ap-span" id="field-address">
            <span>Registered address</span>
            <textarea rows={2} value={draft.address} onChange={(e) => set('address', e.target.value)} autoComplete="street-address" />
            {field('address')}
          </label>
        </div>
      </fieldset>

      <fieldset className="ap-fieldset">
        <legend>Contact</legend>
        <div className="ap-grid">
          <label className="ap-field" id="field-contactName">
            <span>Contact person</span>
            <input value={draft.contactName} onChange={(e) => set('contactName', e.target.value)} autoComplete="name" />
            {field('contactName')}
          </label>
          <label className="ap-field" id="field-designation">
            <span>Designation{company ? '' : ' (optional)'}</span>
            <input value={draft.designation} onChange={(e) => set('designation', e.target.value)} autoComplete="organization-title" />
            {field('designation')}
          </label>
          <label className="ap-field" id="field-email">
            <span>Email</span>
            <input type="email" value={draft.email} onChange={(e) => set('email', e.target.value)} autoComplete="email" />
            {field('email')}
          </label>
          <label className="ap-field" id="field-phone">
            <span>Phone</span>
            <input type="tel" value={draft.phone} onChange={(e) => set('phone', e.target.value)} autoComplete="tel" placeholder="+91" />
            {field('phone')}
          </label>
        </div>
      </fieldset>

      <fieldset className="ap-fieldset">
        <legend>Role on the exchange</legend>
        <div className="ap-roles" role="radiogroup" aria-label="Role">
          {ROLES.map((r) => (
            <label key={r.key} className={`ap-role${draft.role === r.key ? ' on' : ''}`}>
              <input type="radio" name="role" checked={draft.role === r.key} onChange={() => set('role', r.key)} />
              <b>{r.label}</b>
              <span>{r.note}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="ap-fieldset" id="field-useCases">
        <legend>Use cases to test</legend>
        <div className="ap-checks">
          {useCaseOptions.map((uc) => (
            <label key={uc} className={`chip-btn ap-check${draft.useCases.includes(uc) ? ' on' : ''}`}>
              <input type="checkbox" checked={draft.useCases.includes(uc)} onChange={() => toggleUseCase(uc)} />
              {uc}
            </label>
          ))}
        </div>
        {field('useCases')}
        <label className="ap-field" id="field-sandboxObjective">
          <span>Sandbox objective</span>
          <textarea
            rows={4}
            value={draft.sandboxObjective}
            onChange={(e) => set('sandboxObjective', e.target.value)}
            placeholder="What you intend to build and certify, e.g. cashless pre-auth and claim submission from our HMIS for 40 network hospitals."
          />
          {field('sandboxObjective')}
        </label>
      </fieldset>

      <fieldset className="ap-fieldset" id="field-documents">
        <legend>Documents</legend>
        <p className="ap-note">{page.documentsNote}</p>
        <input
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
          onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
        />
        {files.length > 0 && (
          <ul className="ap-files">
            {files.map((f) => (
              <li key={f.name}>
                {f.name} <i>{(f.size / 1024).toFixed(0)} KB</i>
              </li>
            ))}
          </ul>
        )}
        {field('documents')}
      </fieldset>

      {/* Honeypot: hidden from people, irresistible to form bots. */}
      <div className="ap-hp" aria-hidden="true">
        <label>
          Website
          <input tabIndex={-1} autoComplete="off" value={draft.website} onChange={(e) => set('website', e.target.value)} />
        </label>
      </div>

      <label className="ap-consent" id="field-consent">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        <span>{page.consentText}</span>
      </label>
      {field('consent')}

      {failure && (
        <div className="ap-failure" role="alert">
          {failure}
        </div>
      )}

      <div className="doc-ctas">
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? 'Submitting…' : (page.submitLabel ?? 'Submit application')}
        </button>
      </div>
    </form>
  );
}
