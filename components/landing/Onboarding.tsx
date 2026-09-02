import { withBase } from '@/lib/paths';

/**
 * "How to onboard" — the programme's own sequence, from ABDM sandbox
 * registration to production credentials. The order carries information,
 * so the steps are numbered.
 */

const steps = () => [
  {
    title: 'Register on the ABDM sandbox',
    text: 'Fill in the sandbox registration form and you can start building. ABHA verification is not required in the sandbox: you only need it for production, where beneficiaries are authenticated for real.',
    link: { label: 'Sandbox registration', href: 'https://sandbox.abdm.gov.in/sandbox/v3/sandbox-registration' },
  },
  {
    title: 'Integrate and test the APIs',
    text: 'Build against the HCX sandbox: coverage eligibility, pre-auth, claim, payment notice and communication, each with its on_ callback. Use the Postman collections and the DevTools console to exercise every flow.',
    link: { label: 'HCX sandbox documents', href: 'https://hcxsbx.abdm.gov.in/#/documents' },
  },
  {
    title: 'Get sandbox certification',
    text: 'Complete the functional and security test cases for your role. The affiliate sandbox may ask for additional security review (STQC or CERT-In) before it issues the certificates.',
    link: { label: 'Test cases', href: 'https://sandbox.abdm.gov.in/sandbox/v3/new-documentation?doc=TestCases' },
  },
  {
    title: 'Apply for production',
    text: 'Share the functional and security certificates. NHCX assigns your role in production, provisions credentials and registers you as a participant, then you go live.',
    link: { label: 'Apply for sandbox access here', href: withBase('/apply/') },
  },
];

export default function Onboarding() {
  const STEPS = steps();
  return (
    <section id="onboarding" className="lp-onboard" aria-labelledby="onboard-title">
      <div className="lp-wrap">
        <p className="lp-eyebrow" data-reveal="">
          How to onboard
        </p>
        <h2 id="onboard-title" data-reveal="" data-delay="60">
          Four steps from registration to <span>production</span>
        </h2>
        <ol className="lp-onboard-steps">
          {STEPS.map((s, i) => (
            <li key={s.title} className="lp-onboard-step" data-reveal="" data-delay={String(100 + i * 60)}>
              <span className="lp-onboard-num">{String(i + 1).padStart(2, '0')}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
              <a href={s.link.href} className="link-arrow">
                {s.link.label}
              </a>
            </li>
          ))}
        </ol>
        <div className="lp-support" data-reveal="" data-delay="200">
          <div>
            <b>Integration support</b>
            <span>
              Write to <a href="mailto:hcx.integration@nha.gov.in">hcx.integration@nha.gov.in</a> or{' '}
              <a href="mailto:integration.support@nha.gov.in">integration.support@nha.gov.in</a>. A standing call for integrators and
              partners is held on the 22nd of every month.
            </span>
          </div>
          <div>
            <b>Facility registry</b>
            <span>
              Hospitals register their facility in the ABDM Health Facility Registry first:{' '}
              <a href="https://facility.abdm.gov.in/">facility.abdm.gov.in</a>, queries to <a href="mailto:facility@nha.gov.in">facility@nha.gov.in</a>.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
