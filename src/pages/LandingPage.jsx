import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const pillars = [
  {
    title: "Scope",
    copy: "We map your highest-leverage AI opportunities into a clear 30-day execution scope.",
  },
  {
    title: "Build",
    copy: "We rapidly prototype and productionize assistants, automations, and internal tooling.",
  },
  {
    title: "Ship",
    copy: "We launch with measurable outcomes, then iterate from real user and ops data.",
  },
];

const caseStudies = [
  {
    title: "LIDAR Surgical Measurement Prototype",
    copy: "Reduced measurement turnaround with a guided, operator-safe AI-assisted workflow.",
    tag: "Healthcare",
  },
  {
    title: "Research Knowledge Agent",
    copy: "Centralized fragmented internal docs into a private retrieval and answer system.",
    tag: "Internal Ops",
  },
  {
    title: "Quantitative Investment Framework",
    copy: "Automated screening, scoring, and memo drafting for faster investment cycles.",
    tag: "Finance",
  },
];

const faqItems = [
  {
    question: "How is this different from hiring in-house?",
    answer: "You get senior execution immediately without a long hiring cycle or management overhead.",
  },
  {
    question: "What if we already have an AI strategy?",
    answer: "We plug in as an execution partner and turn strategy into shipped systems and measurable wins.",
  },
  {
    question: "How quickly can you ship?",
    answer: "Most engagements deliver a first production workflow in weeks, not quarters.",
  },
  {
    question: "What kinds of teams do you work with?",
    answer: "Founder-led teams, product organizations, and operations groups that need practical AI outcomes.",
  },
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState(0);
  const revealSelector = useMemo(() => ".reveal-on-scroll", []);

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll(revealSelector));
    if (!nodes.length) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -10% 0px" }
    );

    nodes.forEach((node) => observer.observe(node));

    return () => observer.disconnect();
  }, [revealSelector]);

  return (
    <div className="landing-page">
      <section className="landing-hero">
        <div className="landing-hero-content reveal-on-scroll is-visible">
          <p className="landing-eyebrow">BLACKLILY ACCELERATOR</p>
          <h1>Your Competitors Are Already Shipping AI.</h1>
          <p className="landing-lead">
            We help teams design, build, and deploy AI systems that create real leverage instead of
            slide-deck ambition.
          </p>
          <div className="landing-cta-row">
            <Link className="button button-primary landing-cta" to="/login">
              Book a Call
            </Link>
            <a className="button landing-cta-secondary" href="#case-studies">
              See Case Studies
            </a>
          </div>
        </div>
        <div className="landing-hero-glow" aria-hidden="true" />
      </section>

      <section className="landing-pillar-section reveal-on-scroll" id="services">
        <div className="landing-section-inner">
          <h2>One Path. Scope. Build. Ship.</h2>
          <div className="landing-pillars">
            {pillars.map((pillar) => (
              <article key={pillar.title} className="landing-pillar-card">
                <p className="landing-pillar-title">{pillar.title}</p>
                <p>{pillar.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-market-section reveal-on-scroll" id="approach">
        <div className="landing-section-inner landing-market-grid">
          <div className="landing-market-board" aria-label="Market opportunity board">
            <p className="landing-market-title">Market Opportunities</p>
            <ul>
              <li>
                <span>Sales Ops</span>
                <span>AI-automated</span>
              </li>
              <li>
                <span>Support Desk</span>
                <span>AI-automated</span>
              </li>
              <li>
                <span>Research Flow</span>
                <span>AI-automated</span>
              </li>
              <li>
                <span>Back-office</span>
                <span>AI-automated</span>
              </li>
            </ul>
          </div>
          <div>
            <h2>Someone In Your Market Is Automating Right Now. Is It You?</h2>
            <p>
              Every week you delay is a week competitors compound operating advantage. We focus on
              fast shipping and production reliability so your team captures upside first.
            </p>
          </div>
        </div>
      </section>

      <section className="landing-case-section reveal-on-scroll" id="case-studies">
        <div className="landing-section-inner">
          <h2>Case Studies</h2>
          <div className="landing-case-list">
            {caseStudies.map((item) => (
              <article key={item.title} className="landing-case-card">
                <p className="landing-case-tag">{item.tag}</p>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
                <Link className="button" to="/login">
                  View Case Study
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-faq-section reveal-on-scroll" id="faq">
        <div className="landing-section-inner">
          <h2>Questions? We Have Answers.</h2>
          <div className="landing-faq-list">
            {faqItems.map((item, index) => {
              const isOpen = openFaq === index;
              return (
                <article key={item.question} className={`landing-faq-item ${isOpen ? "is-open" : ""}`}>
                  <button
                    type="button"
                    className="landing-faq-question"
                    onClick={() => setOpenFaq(isOpen ? -1 : index)}
                    aria-expanded={isOpen}
                  >
                    {item.question}
                  </button>
                  {isOpen && <p className="landing-faq-answer">{item.answer}</p>}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="landing-final-cta reveal-on-scroll">
        <div className="landing-section-inner landing-final-cta-inner">
          <h2>Get Ahead or Get Left Behind.</h2>
          <p>Build practical AI leverage before your market normalizes around it.</p>
          <Link className="button button-primary landing-cta" to="/login">
            Book A Strategy Call
          </Link>
          <div className="landing-final-glow" aria-hidden="true" />
        </div>
      </section>
    </div>
  );
}
