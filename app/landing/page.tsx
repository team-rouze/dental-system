/* eslint-disable @next/next/no-img-element */
import styles from "./landing.module.css";

const DEMO_URL = "https://calendar.app.google/66rqVeepUyMsziNfA";

export const metadata = {
    title: "Rouze Dental — Your Next $250,000 Is Already in Your Patient Database",
    description:
        "We recover $15,000–$40,000 per month in unscheduled treatment and overdue hygiene without hiring another front desk employee.",
};

export default function LandingPage() {
    return (
        <div className={styles.wrap}>
            {/* ── Navbar ─────────────────────────────────────────────────── */}
            <nav className={styles.nav}>
                <div className={styles.navInner}>
                    <a href="/landing" className={styles.navLogo}>
                        <img src="/logo.png" alt="Rouze Dental" width={34} height={34} />
                        <div className={styles.navLogoText}>
                            <strong>Rouze Dental</strong>
                            <span>Revenue Reactivation</span>
                        </div>
                    </a>
                    <div className={styles.navActions}>
                        <a href="/login" className={styles.navSignIn}>
                            Sign In
                        </a>
                        <a
                            href="/signup"
                            className={`${styles.btn} ${styles.btnPrimary}`}
                        >
                            Get Started →
                        </a>
                    </div>
                </div>
            </nav>

            {/* ── Hero ───────────────────────────────────────────────────── */}
            <section className={styles.hero}>
                <div className={styles.heroGlow} />
                <div className={styles.heroInner}>
                    {/* Eyebrow */}
                    <div className={styles.eyebrow}>
                        Dental Revenue Reactivation System
                    </div>

                    {/* Headline */}
                    <h1 className={styles.heroHeadline}>
                        Your Next $250,000 Is Already<br />in Your Patient Database.
                    </h1>

                    {/* Anchor */}
                    <p className={styles.heroAnchor}>
                        Dentists do not need more new patients.<br />
                        They are leaking revenue from existing ones.
                    </p>

                    {/* Sub */}
                    <p className={styles.heroSub}>
                        We recover $15,000–$40,000 per month in unscheduled treatment and
                        overdue hygiene without hiring another front desk employee.
                    </p>
                    <p className={styles.heroSub2}>
                        Our Dental Revenue Reactivation System automatically re-engages
                        overdue hygiene and unscheduled treatment patients and fills your
                        schedule without adding staff.
                    </p>

                    {/* CTAs */}
                    <div className={styles.heroCtas}>
                        <a
                            href="/signup"
                            className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLg}`}
                        >
                            Get Started Free →
                        </a>
                        <a
                            href={DEMO_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${styles.btn} ${styles.btnGhost} ${styles.btnLg}`}
                        >
                            Book a Demo
                        </a>
                    </div>

                    {/* App Screenshot */}
                    <div className={styles.screenshotWrap}>
                        <div className={styles.screenshotShadow} />
                        <div className={styles.browserMockup}>
                            <div className={styles.browserBar}>
                                <div className={styles.browserDots}>
                                    <span className={`${styles.dot} ${styles.dotRed}`} />
                                    <span className={`${styles.dot} ${styles.dotYellow}`} />
                                    <span className={`${styles.dot} ${styles.dotGreen}`} />
                                </div>
                                <div className={styles.browserUrl}>rouze.ai/dashboard</div>
                            </div>
                            <img
                                src="/app-screenshot.png"
                                alt="Rouze Dental Dashboard"
                                className={styles.screenshotImg}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Trust Bar ──────────────────────────────────────────────── */}
            <section className={styles.trustBar}>
                <div className={styles.sectionInner}>
                    <p className={styles.trustLabel}>
                        Trusted by modern dental teams focused on predictable production
                    </p>
                    <div className={styles.trustLogos}>
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className={styles.logoPill} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Section 1: The Math ────────────────────────────────────── */}
            <section className={styles.edu}>
                <div className={styles.sectionInner}>
                    <div className={styles.sectionTag}>Here&rsquo;s The Math</div>
                    <h2 className={styles.h2}>
                        4 Reactivated Cleanings a Day. That&rsquo;s It.
                    </h2>

                    <p className={styles.bodyText} style={{ maxWidth: 660, margin: "0 auto" }}>
                        The average hygiene visit is worth $180. A few of those turn into
                        fillings, crowns, or perio treatment worth $350 or more. Multiply
                        that across 5 days a week, 50 weeks a year and you&rsquo;re looking at
                        over $250,000 in recovered production.
                    </p>

                    <div className={styles.statCards}>
                        <div className={styles.statCard}>
                            <div className={styles.statValue}>$180</div>
                            <div className={styles.statLabel}>Average hygiene visit</div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statValue}>$350+</div>
                            <div className={styles.statLabel}>
                                When a cleaning uncovers a cavity
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statValue}>$250K+</div>
                            <div className={styles.statLabel}>
                                Annual recovered production from reactivation alone
                            </div>
                        </div>
                    </div>

                    <div className={styles.closingLine}>
                        You don&rsquo;t need more patients. You need the ones you already
                        have back in the chair.
                    </div>
                </div>
            </section>

            {/* ── Section 2: How It Works ─────────────────────────────────── */}
            <section className={styles.hiw}>
                <div className={styles.sectionInner}>
                    <div className={styles.sectionTag}>How It Works</div>
                    <h2 className={styles.h2}>
                        How Rouze Turns Your Patient Database Into Revenue
                    </h2>

                    <div className={styles.stepsGrid}>
                        {[
                            {
                                n: "01",
                                title: "We Scan Your Patient Database",
                                desc: "Rouze connects to your practice management system and identifies every overdue hygiene patient and unscheduled treatment plan sitting untouched.",
                            },
                            {
                                n: "02",
                                title: "We Surface the Revenue You're Missing",
                                desc: "You see exactly how much production is sitting in your database — by patient, by procedure, by dollar amount.",
                            },
                            {
                                n: "03",
                                title: "We Re-Engage Patients Automatically",
                                desc: "Overdue patients receive timely, personalized outreach. Confirmations, reminders, and follow-ups run without your staff lifting a finger.",
                            },
                            {
                                n: "04",
                                title: "We Recover Cancellations Before They Become Empty Chairs",
                                desc: "When someone cancels, Rouze triggers a reschedule workflow immediately so that chair time doesn't turn into lost production.",
                            },
                        ].map((step) => (
                            <div key={step.n} className={styles.stepCard}>
                                <div className={styles.stepNum}>{step.n}</div>
                                <h3 className={styles.stepTitle}>{step.title}</h3>
                                <p className={styles.stepDesc}>{step.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className={styles.sectionCta}>
                        <a
                            href="/signup"
                            className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLg}`}
                        >
                            Get Started Free →
                        </a>
                    </div>
                </div>
            </section>

            {/* ── Section 3: What Happens When Follow-Up Runs Itself ─────── */}
            <section className={styles.value}>
                <div className={styles.sectionInner}>
                    <h2 className={styles.h2}>
                        What Happens When Follow-Up Runs Itself
                    </h2>

                    <div className={styles.compareWrap}>
                        <div className={styles.compareCol}>
                            <div className={`${styles.compareHeader} ${styles.compareHeaderRed}`}>
                                Without Rouze
                            </div>
                            {[
                                "Staff calls when they have time. Overdue patients pile up.",
                                "Cancellations sit in the system. No one follows up.",
                                "Treatment plans get presented, then forgotten.",
                                "Every missed touchpoint is $180–$350 walking out the door.",
                            ].map((item) => (
                                <div key={item} className={styles.compareItem}>
                                    <span className={styles.xMark}>✕</span>
                                    {item}
                                </div>
                            ))}
                        </div>

                        <div className={styles.compareCol}>
                            <div className={`${styles.compareHeader} ${styles.compareHeaderGreen}`}>
                                With Rouze
                            </div>
                            {[
                                "Every overdue patient gets contacted automatically.",
                                "Cancellations trigger an instant reschedule workflow.",
                                "Unscheduled treatment patients are re-engaged until they book.",
                                "Your schedule fills without adding staff or payroll.",
                            ].map((item) => (
                                <div key={item} className={styles.compareItem}>
                                    <span className={styles.checkMark}>✓</span>
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Section 4: Before You Spend More (dark) ─────────────────── */}
            <section className={styles.insight}>
                <div className={styles.insightInner}>
                    <div className={styles.sectionInner}>
                        <div className={styles.sectionTagLight}>Before You Spend More</div>
                        <h2 className={styles.h2Dark}>
                            Your Database Is Worth More Than<br />
                            Your Next Marketing Campaign
                        </h2>
                        <p className={styles.bodyTextLight}>
                            The average practice has 500–1,200 overdue hygiene patients in
                            their system right now. At $180 per visit, that&rsquo;s $90,000 to
                            $216,000 sitting untouched before you even count unscheduled
                            treatment. Most practices pour money into ads to bring in new
                            patients while this revenue goes uncollected. Rouze recovers
                            it first.
                        </p>
                        <div className={styles.closingLineLight}>
                            When reactivation is running, every new patient you add is
                            growth. When it&rsquo;s not, you&rsquo;re just replacing the ones
                            you&rsquo;re losing.
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Section 5: Results ─────────────────────────────────────── */}
            <section className={styles.social}>
                <div className={styles.sectionInner}>
                    <div className={styles.sectionTag}>Results</div>
                    <h2 className={styles.h2}>Practices Using Rouze</h2>

                    <div className={styles.testimonialGrid}>
                        <div className={styles.testimonialCard}>
                            <p className={styles.testimonialText}>
                                &ldquo;We recovered $22,000 in production in the first 60 days.
                                Most of it was overdue hygiene patients we hadn&rsquo;t contacted
                                in over a year.&rdquo;
                            </p>
                            <div className={styles.testimonialAuthor}>
                                — Dr. [Name], [Practice Name], [City, State]
                            </div>
                        </div>

                        <div className={styles.testimonialCard}>
                            <p className={styles.testimonialText}>
                                &ldquo;Our no-show rate dropped by 35% and our hygiene schedule
                                went from 70% to 94% full within 90 days.&rdquo;
                            </p>
                            <div className={styles.testimonialAuthor}>
                                — [Name], Office Manager, [Practice Name]
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Section 6: Demo ────────────────────────────────────────── */}
            <section className={styles.demo}>
                <div className={styles.sectionInner}>
                    <div className={styles.sectionTagTeal}>Free Demo</div>
                    <h2 className={styles.h2}>What You&rsquo;ll See During Your Demo</h2>
                    <p className={styles.bodyText} style={{ maxWidth: 520, margin: "0 auto" }}>
                        During your personalized walkthrough, we&rsquo;ll show you:
                    </p>

                    <ul className={styles.demoList}>
                        <li>
                            How much revenue is sitting unscheduled in your patient database
                        </li>
                        <li>How automated reactivation and confirmations work</li>
                        <li>How cancellations are recovered automatically</li>
                        <li>What onboarding looks like for your practice</li>
                    </ul>

                    <p className={styles.demoNote}>No technical preparation required.</p>

                    <a
                        href={DEMO_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLg}`}
                    >
                        Book a Demo →
                    </a>
                </div>
            </section>

            {/* ── Section 7: Final CTA ────────────────────────────────────── */}
            <section className={styles.finalCta}>
                <div className={styles.finalCtaInner}>
                    <div className={styles.sectionInner}>
                        <h2 className={styles.h2Dark}>
                            Your Next $250,000 Is Waiting.
                        </h2>
                        <p className={styles.bodyTextLight}>
                            Let us show you exactly where it is.
                        </p>
                        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
                            <a
                                href="/signup"
                                className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLg}`}
                            >
                                Get Started Free →
                            </a>
                            <a
                                href={DEMO_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`${styles.btn} ${styles.btnGhost} ${styles.btnLg}`}
                            >
                                Book a Demo
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Footer ─────────────────────────────────────────────────── */}
            <footer className={styles.footer}>
                <div className={styles.footerInner}>
                    <div className={styles.footerLogo}>
                        <img src="/logo.png" alt="Rouze Dental" width={28} height={28} />
                        <div className={styles.footerLogoText}>
                            <strong>Rouze Dental</strong>
                            <span>Revenue Reactivation</span>
                        </div>
                    </div>

                    <p className={styles.footerTagline}>
                        Patient Engagement and Revenue Recovery for Modern Dental Practices
                    </p>

                    <div className={styles.footerLinks}>
                        <a href="/login">Sign In</a>
                        <a href="/signup">Sign Up</a>
                        <a
                            href={DEMO_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.footerLinksBook}
                        >
                            Book a Demo
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
