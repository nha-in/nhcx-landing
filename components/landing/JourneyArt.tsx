/*
 * The four integration-journey illustrations, inline so each part can move.
 * The badge, layers and eye are the design's exported shapes, split into
 * their parts; the rocket is drawn
 * in the same two blues, standing in for the design's play arrow. All the
 * motion is CSS ("journey illustrations" in styles/landing.css) and stops
 * under reduced motion.
 */
const DARK = '#597AFF';
const LIGHT = '#B4C7FF';

/* Complete your ABDM milestones: the medal pops as a tick draws across it. */
function Badge() {
  return (
    <svg className="jart jart-badge" viewBox="0 0 300 298" aria-hidden="true" focusable="false">
      <path d="M105.603 170.579L91.4286 277L150 241.955L208.571 277L194.397 170.462" fill={LIGHT} />
      <g className="medal">
        <path
          d="M150 183.545C195.287 183.545 232 146.935 232 101.773C232 56.6109 195.287 20 150 20C104.713 20 68 56.6109 68 101.773C68 146.935 104.713 183.545 150 183.545Z"
          fill={DARK}
        />
        <path
          className="tick"
          d="M114 104L140 129L188 80"
          pathLength={1}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={14}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

/* Develop and Test: the stack lifts apart as it is built, each layer lights
   up in turn from the bottom as its tests pass, then the stack settles. */
function Layers() {
  return (
    <svg className="jart jart-layers" viewBox="0 0 300 298" aria-hidden="true" focusable="false">
      <path className="l-bot" d="M36.25 205.375L150 262.25L263.75 205.375" fill={LIGHT} />
      <path className="l-mid" d="M36.25 148.5L150 205.375L263.75 148.5" fill={LIGHT} />
      <path className="l-top" d="M150 34.75L36.25 91.625L150 148.5L263.75 91.625L150 34.75Z" fill={DARK} />
    </svg>
  );
}

/* FHIR Validation and UAT: the eye looks left and right, and blinks. */
function Eye() {
  return (
    <svg className="jart jart-eye" viewBox="0 0 300 298" aria-hidden="true" focusable="false">
      <g className="eye">
        <path
          d="M18 136.5C18 136.5 66 52 150 52C234 52 282 136.5 282 136.5C282 136.5 234 221 150 221C66 221 18 136.5 18 136.5Z"
          fill={LIGHT}
        />
        <path
          className="pupil"
          d="M150 168.187C169.882 168.187 186 154.001 186 136.5C186 118.999 169.882 104.812 150 104.812C130.118 104.812 114 118.999 114 136.5C114 154.001 130.118 168.187 150 168.187Z"
          fill={DARK}
        />
      </g>
    </svg>
  );
}

/* HTC Demo and Go Live: the rocket rumbles, smoke puffs out, it launches out
   of the frame on a growing flame, and the next one arrives on the pad. */
function Rocket() {
  return (
    <svg className="jart jart-rocket" viewBox="0 0 300 298" aria-hidden="true" focusable="false">
      <g className="smoke" fill="#DCE4FF">
        <circle className="puff p1" cx="116" cy="262" r="16" />
        <circle className="puff p2" cx="150" cy="270" r="20" />
        <circle className="puff p3" cx="184" cy="262" r="16" />
      </g>
      <g className="rocket">
        <g className="flame-grow">
          <g className="flame">
            <path d="M134 210Q150 276 166 210Z" fill="#FF9F43" />
            <path d="M142 210Q150 248 158 210Z" fill="#FFD66B" />
          </g>
        </g>
        <path d="M112 148L80 200L80 218L112 198Z" fill={LIGHT} />
        <path d="M188 148L220 200L220 218L188 198Z" fill={LIGHT} />
        <path d="M128 198L172 198L166 212L134 212Z" fill={LIGHT} />
        <path d="M150 36C178 58 190 100 190 146L190 198L110 198L110 146C110 100 122 58 150 36Z" fill={DARK} />
        <path d="M150 36C165 48 174 62 179 78L121 78C126 62 135 48 150 36Z" fill={LIGHT} />
        <circle cx="150" cy="124" r="19" fill={LIGHT} />
        <circle cx="150" cy="124" r="11" fill="#EEF2FF" />
      </g>
    </svg>
  );
}

export default function JourneyArt({ kind }: { kind: string }) {
  switch (kind) {
    case 'badge':
      return <Badge />;
    case 'layers':
      return <Layers />;
    case 'eye':
      return <Eye />;
    case 'rocket':
      return <Rocket />;
    default:
      return null;
  }
}
