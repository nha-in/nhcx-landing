/**
 * The one place the browser learns where Strapi is.
 *
 * The site is a static export, so anything dynamic — submitting an
 * application — is a direct call from the browser to the
 * CMS REST API (project decision D1). `NEXT_PUBLIC_CMS_URL` is baked in at
 * build time; it defaults to the local Strapi dev server.
 */
export const CMS_URL = (process.env.NEXT_PUBLIC_CMS_URL ?? 'http://localhost:1337').replace(/\/$/, '');

export const APPLICATION_CREATE = `${CMS_URL}/api/integrator-applications`;
/** Thrown when the CMS cannot be reached at all (offline, CORS, DNS). */
export class CmsUnreachableError extends Error {
  constructor() {
    super('The content service is not reachable');
    this.name = 'CmsUnreachableError';
  }
}

export interface ApplicationDraft {
  entityType: 'company_llp_firm' | 'individual_proprietorship';
  organisationName: string;
  registrationNumber: string;
  address: string;
  contactName: string;
  email: string;
  phone: string;
  designation: string;
  role: 'provider' | 'payer' | 'tpa' | 'hmis_vendor' | 'other';
  useCases: string[];
  sandboxObjective: string;
  /** Honeypot: must stay empty. */
  website: string;
}

export async function submitApplication(
  draft: ApplicationDraft,
  files: File[],
): Promise<{ applicationId: string | null; status: string }> {
  const form = new FormData();
  form.append('data', JSON.stringify(draft));
  for (const file of files) form.append('files.documents', file, file.name);
  let res: Response;
  try {
    res = await fetch(APPLICATION_CREATE, { method: 'POST', body: form });
  } catch {
    throw new CmsUnreachableError();
  }
  const body = (await res.json().catch(() => ({}))) as {
    data?: { applicationId?: string | null; status?: string };
    error?: { message?: string };
  };
  if (!res.ok) throw new Error(body.error?.message ?? `Submission failed (${res.status})`);
  return { applicationId: body.data?.applicationId ?? null, status: body.data?.status ?? 'submitted' };
}
