import Nav from "@/components/Nav";
import Reveal from "@/components/Reveal";
import WaitlistForm from "@/components/WaitlistForm";
import TennisBall from "@/components/TennisBall";

const CITIES = [
  "Austin",
  "Brooklyn",
  "Denver",
  "Seattle",
  "Miami",
  "Oakland",
  "Chicago",
  "Atlanta",
  "Boston",
  "Phoenix",
];

export default function Home() {
  return (
    <main id="top">
      <Nav />

      {/* ============== HERO ============== */}
      <header className="hero">
        <div className="wrap hero__grid">
          <div>
            <div className="hero__eyebrow eyebrow load" style={{ animationDelay: "0.05s" }}>
              <span className="dot" />
              Free · Now in 38 cities
            </div>

            <h1 className="display load" style={{ animationDelay: "0.15s" }}>
              Never play <br />
              <span className="mark">alone</span> again.
            </h1>

            <p className="hero__sub load" style={{ animationDelay: "0.3s" }}>
              Rally matches you with local players at your level. Set your
              availability, get matched, and book a court — most players are
              hitting within 24 hours.
            </p>

            <div className="load" style={{ animationDelay: "0.45s" }}>
              <WaitlistForm cta="Find players near me" />
            </div>

            <div className="hero__proof load" style={{ animationDelay: "0.6s" }}>
              <div className="avatars">
                <span className="av" style={{ background: "var(--clay)" }}>MR</span>
                <span className="av" style={{ background: "var(--clay-deep)" }}>JT</span>
                <span className="av" style={{ background: "var(--clay-bright)" }}>SP</span>
                <span className="av" style={{ background: "var(--clay)" }}>+</span>
              </div>
              <span>
                <b>12,400+ players</b> rallying this week
                <br />
                <span className="stars">★★★★★</span> 4.9 average match rating
              </span>
            </div>
          </div>

          {/* Match-card mockup visual */}
          <div className="hero__visual load" style={{ animationDelay: "0.4s" }}>
            <div className="court-panel">
              <div className="lines" />
              <TennisBall size={56} className="ball floating-ball" />
            </div>

            <div className="match-card">
              <div className="match-card__top">
                <span className="match-card__tag">
                  <TennisBall size={12} /> MATCH FOUND
                </span>
                <span className="match-card__time">in 18 hrs</span>
              </div>
              <div className="match-card__player">
                <span className="av">MR</span>
                <div>
                  <div className="name">Maya R.</div>
                  <div className="meta">1.2 mi away · plays mornings</div>
                </div>
              </div>
              <div className="match-card__stats">
                <span className="chip accent">UTR 6.2</span>
                <span className="chip">Singles</span>
                <span className="chip">Riverside Courts</span>
              </div>
              <div className="match-card__cta">Confirm · Sat 7:00 AM</div>
            </div>
          </div>
        </div>
      </header>

      {/* ============== CITY MARQUEE ============== */}
      <div className="marquee" aria-hidden="true">
        <div className="marquee__track">
          {[...CITIES, ...CITIES].map((c, i) => (
            <span key={i}>{c}</span>
          ))}
        </div>
      </div>

      {/* ============== STATS ============== */}
      <section className="section" style={{ paddingTop: "clamp(56px,8vw,96px)" }}>
        <div className="wrap">
          <Reveal>
            <div className="stats">
              <div className="stat">
                <div className="num">12.4k</div>
                <div className="label">Active players</div>
              </div>
              <div className="stat">
                <div className="num">&lt;24h</div>
                <div className="label">Avg. to first match</div>
              </div>
              <div className="stat">
                <div className="num">38</div>
                <div className="label">Cities live</div>
              </div>
              <div className="stat">
                <div className="num">4.9★</div>
                <div className="label">Match rating</div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============== HOW IT WORKS ============== */}
      <section className="section" id="how" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <Reveal>
            <div className="head">
              <span className="eyebrow">How it works</span>
              <h2 className="display">Three steps to your next hit.</h2>
            </div>
          </Reveal>

          <div className="steps">
            <Reveal delay={0}>
              <div className="step">
                <span className="step__n">STEP 01</span>
                <div className="step__icon">
                  <TennisBall size={32} />
                </div>
                <h3>Tell us your game</h3>
                <p>
                  Drop your level (UTR or NTRP), your neighborhood, and the
                  hours you can actually play. Takes about 40 seconds.
                </p>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <div className="step">
                <span className="step__n">STEP 02</span>
                <div className="step__icon">
                  <TennisBall size={32} />
                </div>
                <h3>Get matched</h3>
                <p>
                  We surface real players nearby at your level who want to hit
                  when you&apos;re free. No endless swiping.
                </p>
              </div>
            </Reveal>
            <Reveal delay={240}>
              <div className="step">
                <span className="step__n">STEP 03</span>
                <div className="step__icon">
                  <TennisBall size={32} />
                </div>
                <h3>Rally</h3>
                <p>
                  Confirm a time, pick a court from the built-in finder, and
                  show up. Rate each other after to keep matches sharp.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============== WHY RALLY (features) ============== */}
      <section className="section features" id="why">
        <div className="wrap">
          <Reveal>
            <div className="head">
              <span className="eyebrow">Why Rally</span>
              <h2 className="display">Built so every hit is worth the drive.</h2>
            </div>
          </Reveal>

          <div className="fgrid">
            <Reveal className="feature big" delay={0}>
              <div className="ficon">≈</div>
              <h3>Matched by skill, not luck</h3>
              <p>
                Rally reads your UTR and NTRP so you&apos;re paired with someone
                who genuinely pushes your game — no blowouts, no getting
                bageled. Every rally counts.
              </p>
            </Reveal>
            <Reveal className="feature small" delay={100}>
              <div className="ficon">✓</div>
              <h3>No-flake community</h3>
              <p>
                ID-verified players with public reliability scores. Flakes get
                filtered out fast.
              </p>
            </Reveal>
            <Reveal className="feature small" delay={0}>
              <div className="ficon">◎</div>
              <h3>Courts built in</h3>
              <p>
                Find and reserve nearby public and club courts without ever
                leaving the app.
              </p>
            </Reveal>
            <Reveal className="feature small" delay={100}>
              <div className="ficon">◷</div>
              <h3>Plays your schedule</h3>
              <p>
                Dawn patrol or after-work lights — match strictly on the windows
                you&apos;re actually free.
              </p>
            </Reveal>
            <Reveal className="feature small" delay={200}>
              <div className="ficon">⊞</div>
              <h3>Singles, doubles, drills</h3>
              <p>
                Want a hitting partner, a fourth, or someone to grind
                cross-courts? Pick the format.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============== TESTIMONIAL ============== */}
      <section className="section">
        <div className="wrap">
          <Reveal>
            <div className="quote">
              <span className="mark">&ldquo;</span>
              <blockquote className="display">
                I moved to a new city and had a regular hitting partner within a
                week. Rally basically rebuilt my tennis life.
              </blockquote>
              <div className="who">
                <span className="av">JT</span>
                <div className="meta">
                  <b>Jordan T.</b>
                  <span>3.5 NTRP · Austin, TX</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============== FAQ ============== */}
      <section className="section" id="faq" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <Reveal>
            <div className="head center">
              <span className="eyebrow">Questions</span>
              <h2 className="display">Everything before your first serve.</h2>
            </div>
          </Reveal>

          <Reveal>
            <div className="faq">
              <details open>
                <summary>
                  Is Rally free? <span className="plus">+</span>
                </summary>
                <p>
                  Yes — creating a profile and getting matched is completely
                  free. We offer an optional Pro tier for priority matching and
                  court bookings, but you&apos;ll never pay to find your first
                  hitting partner.
                </p>
              </details>
              <details>
                <summary>
                  How does the matching work? <span className="plus">+</span>
                </summary>
                <p>
                  We combine your stated level (UTR/NTRP), location radius, and
                  availability windows to surface players who actually fit. You
                  approve every match before any contact happens.
                </p>
              </details>
              <details>
                <summary>
                  Is it safe to meet a match? <span className="plus">+</span>
                </summary>
                <p>
                  Every player is ID-verified, carries a public reliability and
                  sportsmanship score, and you only ever meet at public or club
                  courts. You can report or block anyone instantly.
                </p>
              </details>
              <details>
                <summary>
                  What if I&apos;m a beginner? <span className="plus">+</span>
                </summary>
                <p>
                  Rally spans every level from first-timers to 5.0+ and college
                  players. Beginners are matched with patient partners and
                  nearby clinics, so you&apos;re never out of your depth.
                </p>
              </details>
              <details>
                <summary>
                  Which cities are live? <span className="plus">+</span>
                </summary>
                <p>
                  We&apos;re in 38 metros across the US and adding more every
                  month. Not in your city yet? Join and we&apos;ll notify you
                  the day Rally launches near you.
                </p>
              </details>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============== FINAL CTA ============== */}
      <section className="section cta" id="join">
        <span className="court-line cl1" />
        <span className="court-line cl2" />
        <div className="wrap cta__inner">
          <Reveal>
            <span className="eyebrow" style={{ color: "var(--clay-deep)" }}>
              Your court is waiting
            </span>
            <h2 className="display" style={{ marginTop: 16 }}>
              Your next rally is one tap away.
            </h2>
            <p>
              Join 12,400+ players already hitting. Tell us your level and
              we&apos;ll find your match — most players play within 24 hours.
            </p>
            <WaitlistForm cta="Get matched free" />
          </Reveal>
        </div>
      </section>

      {/* ============== FOOTER ============== */}
      <footer className="footer">
        <div className="wrap">
          <div className="footer__top">
            <div style={{ maxWidth: 280 }}>
              <a href="#top" className="logo">
                <TennisBall size={28} />
                Rally
              </a>
              <p
                style={{
                  marginTop: 14,
                  fontSize: "0.92rem",
                  color: "color-mix(in srgb, var(--cream) 70%, transparent)",
                }}
              >
                Find a hitting partner near you. Set your level, get matched,
                and play.
              </p>
            </div>
            <div className="footer__links">
              <div className="footer__col">
                <h4>Product</h4>
                <a href="#how">How it works</a>
                <a href="#why">Why Rally</a>
                <a href="#faq">FAQ</a>
                <a href="#join">Get matched</a>
              </div>
              <div className="footer__col">
                <h4>Company</h4>
                <a href="#">About</a>
                <a href="#">Cities</a>
                <a href="#">Careers</a>
                <a href="#">Press</a>
              </div>
              <div className="footer__col">
                <h4>Legal</h4>
                <a href="#">Privacy</a>
                <a href="#">Terms</a>
                <a href="#">Safety</a>
              </div>
            </div>
          </div>
          <div className="footer__bottom">
            <span>© 2026 Rally Tennis, Inc.</span>
            <span>Made for players who&apos;d rather be on court.</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
