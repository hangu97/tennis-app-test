import TennisBall from "./TennisBall";

/**
 * The brand + social-proof panel shown alongside the auth forms.
 * CRO: reinforces value, reduces signup anxiety with proof + trust signals.
 */
export default function AuthAside() {
  return (
    <aside className="auth__aside">
      <a href="/" className="logo auth__logo">
        <TennisBall size={30} />
        Rally
      </a>

      <div className="auth__pitch">
        <span className="eyebrow">Courtside since the first serve</span>
        <h2 className="display">
          Your next <span className="hl">hitting partner</span> is three taps
          away.
        </h2>
        <p>
          Set when you play, see who&apos;s free near you, and lock in a match.
          Most players are on court within 24 hours.
        </p>
      </div>

      <ul className="auth__proof">
        <li>
          <b>2,400+</b>
          <span>players matched</span>
        </li>
        <li>
          <b>4.9★</b>
          <span>avg. match rating</span>
        </li>
        <li>
          <b>&lt;24h</b>
          <span>to first hit</span>
        </li>
      </ul>

      <blockquote className="auth__quote">
        &ldquo;I had a regular doubles crew within a week. Rally just works.&rdquo;
        <cite>— Alex T., 3.5</cite>
      </blockquote>
    </aside>
  );
}
