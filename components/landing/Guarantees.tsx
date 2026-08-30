const ITEMS = [
  {
    label: 'Fewer data queries',
    icon: (
      <>
        <path pathLength="1" d="M12 3 21 7.5 12 12 3 7.5 12 3Z" />
        <path pathLength="1" d="M3 12.2 12 16.7l9-4.5" />
        <path pathLength="1" d="M3 16.7 12 21.2l9-4.5" />
      </>
    ),
  },
  {
    label: 'Greater data precision',
    icon: (
      <>
        <circle pathLength="1" cx="12" cy="12" r="8.5" />
        <circle pathLength="1" cx="12" cy="12" r="4" />
        <circle cx="12" cy="12" r="0.9" stroke="none" data-dot="" />
      </>
    ),
  },
  {
    label: 'Faster claim processing',
    icon: (
      <>
        <path pathLength="1" d="M3 6l7 6-7 6V6Z" />
        <path pathLength="1" d="M13 6l7 6-7 6V6Z" />
      </>
    ),
  },
  {
    label: 'Scalability',
    icon: (
      <>
        <path pathLength="1" d="M3 17l6.5-7 4 4L21 6" />
        <path pathLength="1" d="M15.5 6H21v5.5" />
      </>
    ),
  },
];

export default function Guarantees() {
  return (
    <section className="lp-guarantees" aria-labelledby="guarantees-title">
      <div className="lp-wrap">
        <h2 id="guarantees-title" data-reveal="">
          What <span>NHCX</span> guarantees
        </h2>
        <ul className="lp-tabs" data-reveal="" data-delay="80">
          {ITEMS.map((item) => (
            <li key={item.label} className="lp-tab" tabIndex={0}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" strokeWidth="1.4" strokeLinejoin="round" aria-hidden="true">
                {item.icon}
              </svg>
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
