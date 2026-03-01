/* eslint-disable @next/next/no-img-element */
import styles from "./landing.module.css";

const DEMO_URL = "https://calendar.app.google/66rqVeepUyMsziNfA";

export const metadata = {
    title: "Rouze Dental — Fill More Chairs Without Chasing More Patients",
    description:
        "Rouze.ai helps dental practices recover missed revenue by automatically reactivating overdue patients, confirming appointments, and recovering cancellations.",
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
                        Your intelligent patient engagement system for dental practices
                    </div>

                    {/* Headline */}
                    <h1 className={styles.heroHeadline}>
                        Fill More Chairs Without<br />Chasing More Patients
                    </h1>

                    {/* Sub */}
                    <p className={styles.heroSub}>
                        Rouze.ai helps dental practices recover missed revenue by automatically
                        reactivating overdue patients, confirming appointments, and recovering
                        cancellations before they turn into empty chair time.
                    </p>
                    <p className={styles.heroSub2}>
                        Built specifically for dental workflows, Rouze works quietly in the
                        background — your team focuses on care, not reminders.
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

            {/* ── Education ──────────────────────────────────────────────── */}
            <section className={styles.edu}>
                <div className={styles.sectionInner}>
                    <h2 className={styles.h2}>
                        Most Practices Do Not Lose Revenue Because of Marketing<br />
                        <span>They Lose It Because Follow Up Breaks Down</span>
                    </h2>

                    <p className={styles.bodyText} style={{ maxWidth: 600, margin: "0 auto" }}>
                        Every dental practice already has patients who intend to return.
                        The problem is consistency.
                    </p>

                    <div className={styles.painPoints}>
                        <div className={styles.painPoint}>Appointments go unconfirmed.</div>
                        <div className={styles.painPoint}>
                            Treatment plans remain unscheduled.
                        </div>
                        <div className={styles.painPoint}>
                            Cancelled visits never get rescheduled.
                        </div>
                    </div>

                    <p className={styles.eduFooter}>
                        These small gaps quietly compound into lost production every week.{" "}
                        <span className={styles.tealAccent}>Rouze.ai</span> fixes the operational
                        layer behind patient engagement so opportunities do not slip through
                        the cracks.
                    </p>
                </div>
            </section>

            {/* ── How It Works ───────────────────────────────────────────── */}
            <section className={styles.hiw}>
                <div className={styles.sectionInner}>
                    <div className={styles.sectionTag}>How It Works</div>
                    <h2 className={styles.h2}>
                        How Rouze.ai Keeps Your Schedule Full
                    </h2>

                    <div className={styles.stepsGrid}>
                        {[
                            {
                                n: "01",
                                title: "Connect Your Practice System",
                                desc: "Rouze securely connects to your existing practice management software and analyzes patient activity.",
                            },
                            {
                                n: "02",
                                title: "Identify Missed Opportunities",
                                desc: "Overdue hygiene visits, inactive patients, and unscheduled treatments are automatically detected.",
                            },
                            {
                                n: "03",
                                title: "Automate Patient Engagement",
                                desc: "Patients receive timely reminders, confirmations, and follow ups without adding work for your staff.",
                            },
                            {
                                n: "04",
                                title: "Protect and Recover Appointments",
                                desc: "Structured confirmation and reschedule workflows reduce no shows and prevent lost chair time.",
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

            {/* ── Features ───────────────────────────────────────────────── */}
            <section className={styles.features}>
                <div className={styles.sectionInner}>
                    <div className={styles.sectionTagTeal}>Features</div>
                    <h2 className={styles.h2}>
                        Powerful Automation Designed for Dental Operations
                    </h2>

                    <div className={styles.featuresGrid}>
                        {[
                            {
                                icon: "↩",
                                title: "Intelligent Patient Reactivation",
                                desc: "Automatically reconnect with patients who are overdue for hygiene or have unfinished treatment plans.",
                            },
                            {
                                icon: "✓",
                                title: "Appointment Confirmation Workflows",
                                desc: "Structured reminder sequences encourage patients to confirm visits before appointment day.",
                            },
                            {
                                icon: "⟳",
                                title: "Cancellation Recovery",
                                desc: "When appointments cancel, Rouze immediately encourages patients to reschedule, helping protect production.",
                            },
                            {
                                icon: "⚙",
                                title: "Workflow Customization",
                                desc: "Adjust timing and messaging preferences to match exactly how your practice operates.",
                            },
                        ].map((f) => (
                            <div key={f.title} className={styles.featureCard}>
                                <div className={styles.featureIconWrap}>{f.icon}</div>
                                <h3 className={styles.featureTitle}>{f.title}</h3>
                                <p className={styles.featureDesc}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Value Comparison ───────────────────────────────────────── */}
            <section className={styles.value}>
                <div className={styles.sectionInner}>
                    <h2 className={styles.h2}>
                        Consistency Beats Manual Follow Up Every Time
                    </h2>

                    <div className={styles.compareWrap}>
                        {/* Manual */}
                        <div className={styles.compareCol}>
                            <div
                                className={`${styles.compareHeader} ${styles.compareHeaderRed}`}
                            >
                                Manual Processes
                            </div>
                            {[
                                "Staff reminders depend on availability",
                                "Follow ups are inconsistent",
                                "Cancellations often go unrecovered",
                                "Administrative workload increases",
                            ].map((item) => (
                                <div key={item} className={styles.compareItem}>
                                    <span className={styles.xMark}>✕</span>
                                    {item}
                                </div>
                            ))}
                        </div>

                        {/* With Rouze */}
                        <div className={styles.compareCol}>
                            <div
                                className={`${styles.compareHeader} ${styles.compareHeaderGreen}`}
                            >
                                With Rouze.ai
                            </div>
                            {[
                                "Every patient receives consistent outreach",
                                "Confirmations happen automatically",
                                "Cancelled appointments trigger recovery workflows",
                                "Your team spends less time chasing patients",
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

            {/* ── Educational Insight (dark) ──────────────────────────────── */}
            <section className={styles.insight}>
                <div className={styles.insightInner}>
                    <div className={styles.sectionInner}>
                        <div className={styles.sectionTagLight}>Before You Spend More</div>
                        <h2 className={styles.h2Dark}>
                            Before Spending More on Patient Acquisition<br />
                            Make Sure You Are Maximizing the Patients You Already Have
                        </h2>
                        <p className={styles.bodyTextLight}>
                            Many practices invest heavily in attracting new patients while existing
                            opportunities remain untouched. Rouze.ai focuses on stabilizing
                            production first by improving recall, confirmation, and rescheduling
                            processes. When follow up becomes predictable, revenue becomes
                            predictable.
                        </p>
                    </div>
                </div>
            </section>

            {/* ── Social Proof ───────────────────────────────────────────── */}
            <section className={styles.social}>
                <div className={styles.sectionInner}>
                    <div className={styles.sectionTag}>Built for Real Dental Workflows</div>
                    <h2 className={styles.h2}>
                        Practices Rely on Rouze to Keep Schedules Full
                    </h2>
                    <p className={styles.bodyText} style={{ maxWidth: 640, margin: "0 auto" }}>
                        Rouze.ai is not a generic messaging tool. It is designed specifically
                        around how dental practices operate day to day. Practices use Rouze to
                        improve schedule reliability, reduce administrative pressure, and create
                        consistent patient engagement without increasing payroll.
                    </p>

                    <div className={styles.testimonialCard}>
                        <p className={styles.testimonialText}>
                            &ldquo;We stopped losing patients between hygiene visits. Rouze handles
                            all the follow up that used to fall through the cracks — and our chairs
                            are fuller because of it.&rdquo;
                        </p>
                        <div className={styles.testimonialAuthor}>
                            — Practice Manager, Modern Dental Group
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Demo Expectation ───────────────────────────────────────── */}
            <section className={styles.demo}>
                <div className={styles.sectionInner}>
                    <div className={styles.sectionTagTeal}>Free Demo</div>
                    <h2 className={styles.h2}>What You Will See During Your Demo</h2>
                    <p className={styles.bodyText} style={{ maxWidth: 520, margin: "0 auto" }}>
                        During your personalized walkthrough, we will show you:
                    </p>

                    <ul className={styles.demoList}>
                        <li>
                            How revenue opportunities are identified inside your patient database
                        </li>
                        <li>How automated confirmations and follow ups work</li>
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

            {/* ── Final CTA ──────────────────────────────────────────────── */}
            <section className={styles.finalCta}>
                <div className={styles.finalCtaInner}>
                    <div className={styles.sectionInner}>
                        <h2 className={styles.h2Dark}>
                            Stop Letting Empty Chair Time<br />Control Your Production
                        </h2>
                        <p className={styles.bodyTextLight}>
                            Rouze.ai helps dental practices turn existing patient relationships
                            into consistent, predictable appointments through intelligent automation.
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
