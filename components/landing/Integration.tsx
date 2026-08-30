import { withBase } from '@/lib/paths';

const ITEMS = [
  {
    title: 'Send data, not the document',
    text: 'Your hospital system already captures the clinical data a claim needs. NHCX moves that data as structured information instead of converting it into PDFs, images or scanned attachments.',
  },
  {
    title: 'Preserve clinical detail',
    text: 'Diagnoses, procedures, drugs and bill lines travel as coded values, so nothing is lost in translation between the hospital and the payer.',
  },
  {
    title: 'Improve claim accuracy',
    text: 'Bundles are validated against the specification before they leave, so incomplete claims are caught at source instead of coming back as queries.',
  },
  {
    title: 'Enable automation',
    text: 'Machine-readable claims let payer rules engines price routine cases straight through, and let hospitals reconcile settlements automatically.',
  },
];

/** "NHCX developer integration" — an accordion beside a bundle illustration, with links into the console. */
export default function Integration({ consoleUrl }: { consoleUrl: string }) {
  const docs = withBase('/documentation/');
  return (
    <section id="integration" className="lp-integration" aria-labelledby="integration-title">
      <div className="lp-wrap">
        <h2 id="integration-title" data-reveal="">
          NHCX <span>developer integration</span>
        </h2>
        <div className="lp-int-grid">
          <div data-reveal="" data-delay="60">
            <div className="lp-acc">
              {ITEMS.map((item, i) => (
                <details key={item.title} open={i === 0}>
                  <summary>{item.title}</summary>
                  <div className="lp-acc-body">
                    <div>
                      <p>{item.text}</p>
                      <a href={docs}>Learn more in the doc →</a>
                    </div>
                  </div>
                </details>
              ))}
            </div>
            <div className="lp-int-links">
              <a href={`${consoleUrl}/apis`} className="link-arrow">
                Explore the API catalogue
              </a>
              <a href={`${consoleUrl}/learn`} className="link-arrow">
                Start the learning path
              </a>
              <a href={withBase('/download/')} className="link-arrow">
                Downloads
              </a>
            </div>
          </div>
          <div className="lp-int-art" data-reveal="" data-delay="140" aria-hidden="true">
            <div className="lp-int-art-glow" />
            <div className="lp-mock">
              <div className="lp-mock-bar">
                <span className="lp-dots">
                  <span />
                  <span />
                  <span />
                </span>
                <span className="lp-mock-url">POST /v1/claim/submit</span>
              </div>
              <pre className="lp-code">
                <span className="n">1</span>{'{\n'}
                <span className="n">2</span>  <span className="k">&quot;resourceType&quot;</span>: <span className="s">&quot;Bundle&quot;</span>,{'\n'}
                <span className="n">3</span>  <span className="k">&quot;type&quot;</span>: <span className="s">&quot;collection&quot;</span>,{'\n'}
                <span className="n">4</span>  <span className="k">&quot;entry&quot;</span>: [{'\n'}
                <span className="n">5</span>    {'{ '}<span className="k">&quot;resource&quot;</span>: {'{ '}<span className="k">&quot;resourceType&quot;</span>: <span className="s">&quot;Claim&quot;</span>, <span className="k">&quot;status&quot;</span>: <span className="s">&quot;active&quot;</span> {'} },\n'}
                <span className="n">6</span>    {'{ '}<span className="k">&quot;resource&quot;</span>: {'{ '}<span className="k">&quot;resourceType&quot;</span>: <span className="s">&quot;Patient&quot;</span> {'} },\n'}
                <span className="n">7</span>    {'{ '}<span className="k">&quot;resource&quot;</span>: {'{ '}<span className="k">&quot;resourceType&quot;</span>: <span className="s">&quot;Condition&quot;</span>, <span className="k">&quot;code&quot;</span>: <span className="s">&quot;ICD-10 I21.0&quot;</span> {'} },\n'}
                <span className="n">8</span>    {'{ '}<span className="k">&quot;resource&quot;</span>: {'{ '}<span className="k">&quot;resourceType&quot;</span>: <span className="s">&quot;Procedure&quot;</span>, <span className="k">&quot;code&quot;</span>: <span className="s">&quot;SNOMED 232717009&quot;</span> {'} }\n'}
                <span className="n">9</span>  ],{'\n'}
                <span className="n">10</span>  <span className="k">&quot;signature&quot;</span>: {'{ '}<span className="k">&quot;type&quot;</span>: <span className="s">&quot;JWS&quot;</span>, <span className="k">&quot;who&quot;</span>: <span className="s">&quot;HMIS-4471&quot;</span> {'}\n'}
                <span className="n">11</span>{'}'}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
