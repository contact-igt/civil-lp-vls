import Image from 'next/image';
import { EnquiryForm } from '../components/enquiry-form';
import { PageInteractions } from '../components/page-interactions';
import { audience, course, faqs, journey, objectives, units } from '../lib/course';
import { siteUrl } from '../lib/site';

const academy = course.contact;
const enquiry = '#enquire';

function PhoneLink({ label = academy.phoneLabel }: { label?: string }) {
  return <a href={`tel:${academy.phone}`} data-event="phone_click">{label}</a>;
}

export default function Home() {
  const organisation = {
    '@type': 'Organization', '@id': `${academy.website}#organization`, name: academy.name,
    url: academy.website, telephone: academy.phone, email: academy.email,
    logo: new URL('/assets/icons/vls-logo-black.png', academy.website).href,
    sameAs: academy.socials.map(([, url]) => url),
  };
  const structured = {
    '@context': 'https://schema.org',
    '@graph': [
      organisation,
      {
        '@type': 'Course', name: course.name,
        description: course.description,
        courseCode: course.module,
        isPartOf: { '@type': 'EducationalOccupationalProgram', name: course.programme },
        provider: { '@id': organisation['@id'] },
        ...(siteUrl ? { url: siteUrl } : {}),
      },
    ],
  };

  return (
    <>
      <a className="skip-link" href="#content">Skip to main content</a>
      <header className="site-header">
        <div className="shell header-inner">
          <a className="header-brand" href="#" aria-label="VLS Law Academy course home">
            <Image src="/vls/logo.png" alt="" width={234} height={234} unoptimized />
          </a>
          <nav className="header-nav" aria-label="Main navigation">
            <a href="#about">About</a>
            <a href="#curriculum">Curriculum</a>
            <a href="#faqs">FAQs</a>
          </nav>
          <a className="button button-primary header-cta" href={enquiry} data-event="enquire_click" data-placement="header">Enquire Now</a>
        </div>
      </header>
      <main id="content" tabIndex={-1}>
        <section className="hero" aria-labelledby="course-title">
          <div className="shell hero-grid">
            <div className="hero-copy">
              <p className="eyebrow"><span />{course.programme} · Module {course.module}</p>
              <h1 id="course-title">Civil Procedure <span>&amp; Civil Trial.</span></h1>
              <p className="hero-tagline">{course.tagline}</p>
              <p className="hero-description">{course.description}</p>
              <div className="hero-actions">
                <a className="button button-primary" href={enquiry} data-event="enquire_click" data-placement="hero">Enquire Now</a>
                <a className="button button-outline" href="#curriculum">Explore Curriculum</a>
              </div>
              <p className="hero-audience">For law students, law graduates and practising advocates.</p>
            </div>
            <figure className="hero-figure">
              <div className="hero-image">
                <picture>
                  <source media="(max-width: 699px)" srcSet="/vls/hero-mobile.webp" />
                  {/* The local WebP files are pre-sized and encoded for this layout. */}
                  <img src="/vls/hero.webp" width="1200" height="900" fetchPriority="high" alt="An instructor gestures toward seated learners in a VLS Law Academy classroom" />
                </picture>
              </div>
              <figcaption>Inside a VLS Law Academy classroom <span>Chennai</span></figcaption>
            </figure>
          </div>
        </section>

        <section className="section" id="about" aria-labelledby="about-title">
          <div className="shell">
            <div className="section-intro editorial-split">
              <div>
                <p className="eyebrow"><span />Theory to practice</p>
                <h2 id="about-title">Knowing the CPC is one thing. Knowing how to practise it is another.</h2>
              </div>
              <p>Civil litigation calls for more than recalling provisions of the Code of Civil Procedure. This module follows a suit through the courts so you can see when those provisions apply and how one procedural step leads to the next.</p>
            </div>
            <ol className="objectives">
              {objectives.map(([heading, copy], index) => (
                <li key={heading}>
                  <span className="objective-number" aria-hidden="true">0{index + 1}</span>
                  <h3>{heading}</h3>
                  <p>{copy}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="section journey-section" aria-labelledby="journey-title">
          <div className="shell">
            <div className="section-intro">
              <p className="eyebrow"><span />The life of a civil suit</p>
              <h2 id="journey-title">The Civil Litigation Journey</h2>
            </div>
            <ol className="journey-list">
              {journey.map(([stage, copy], index) => (
                <li key={stage}>
                  <span className="journey-marker" aria-hidden="true">0{index + 1}</span>
                  <h3>{stage}</h3>
                  <p>{copy}</p>
                </li>
              ))}
            </ol>
            <p className="journey-note">This sequence is illustrative. The stages and their order can vary depending on the proceedings.</p>
          </div>
        </section>

        <section className="section" id="curriculum" aria-labelledby="curriculum-title">
          <div className="shell editorial-split curriculum-grid">
            <div className="section-intro">
              <p className="eyebrow"><span />Curriculum</p>
              <h2 id="curriculum-title">Understand Civil Litigation, Step by Step.</h2>
              <p>Five units follow the life of a civil suit and cover the rules that govern its day-to-day conduct.</p>
            </div>
            <div className="disclosures curriculum-list">
              {units.map((unit, index) => (
                <details key={unit.title} name="civil-units">
                  <summary>
                    <span className="unit-number">Unit 0{index + 1}</span>
                    <span className="summary-copy"><strong>{unit.title}</strong><span>{unit.summary}</span></span>
                    <span className="disclosure-icon" aria-hidden="true" />
                  </summary>
                  <dl className="disclosure-body">
                    {unit.topics.map(([topic, detail]) => <div key={topic}><dt>{topic}</dt><dd>{detail}</dd></div>)}
                  </dl>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="section audience-section" aria-labelledby="audience-title">
          <div className="shell photo-split">
            <figure className="section-photo">
              <Image src="/vls/audience.webp" alt="VLS Law Academy learners watch an instructor explain a topic at the front of the room" width={750} height={469} unoptimized />
            </figure>
            <div className="section-intro">
              <p className="eyebrow"><span />Who should join</p>
              <h2 id="audience-title">Built for the practice of law.</h2>
              <p>VLS Law Academy is a Chennai-based legal education institute. Its Decoding of Practice programme connects legal concepts with the work advocates do in court.</p>
              <ul className="audience-list">{audience.map(item => <li key={item}>{item}</li>)}</ul>
            </div>
          </div>
        </section>

        <section className="section trust-section" aria-labelledby="trust-title">
          <div className="shell photo-split trust-grid">
            <div className="section-intro">
              <p className="eyebrow"><span />VLS Law Academy</p>
              <h2 id="trust-title">Learn with VLS.</h2>
              <p>See how learners describe their experience in VLS Law Academy’s wider Decoding of Practice programme.</p>
              <a className="button button-outline" href={academy.programmeTestimonial}>Watch programme testimonials</a>
            </div>
            <figure className="section-photo">
              <Image src="/vls/academy.webp" alt="A wide view of a VLS Law Academy class with an instructor beside a presentation screen" width={1080} height={604} unoptimized />
            </figure>
          </div>
        </section>

        <section className="section faq-section" id="faqs" aria-labelledby="faq-title">
          <div className="shell editorial-split faq-grid">
            <div className="section-intro">
              <p className="eyebrow"><span />FAQs</p>
              <h2 id="faq-title">Frequently asked questions.</h2>
            </div>
            <div className="disclosures">
              {faqs.map(([question, answer]) => (
                <details key={question} name="civil-faqs">
                  <summary><span>{question}</span><span className="disclosure-icon" aria-hidden="true" /></summary>
                  <p className="disclosure-body">{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="section enquiry-section" id="enquire" aria-labelledby="enquiry-title">
          <div className="shell enquiry-grid">
            <div className="section-intro">
              <p className="eyebrow"><span />Admission enquiry</p>
              <h2 id="enquiry-title">Take the Next Step in Your Civil Litigation Learning.</h2>
              <p>Share your details to receive the upcoming batch information and admission guidance from VLS Law Academy.</p>
              <div className="contact-actions">
                <PhoneLink label="Call admissions" />
                <a href={academy.whatsapp} className="whatsapp-link" data-event="whatsapp_click">WhatsApp admissions</a>
              </div>
            </div>
            <EnquiryForm />
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="shell">
          <div className="footer-grid">
            <div>
              <a className="footer-brand" href={academy.website} aria-label="VLS Law Academy official website"><Image src="/vls/logo.png" alt="" width={234} height={234} unoptimized /></a>
              <p>{course.programme} · Module {course.module}</p>
            </div>
            <div>
              <h2>Contact</h2>
              <address>{academy.address}</address>
              <PhoneLink />
              <a href={`mailto:${academy.email}`}>{academy.email}</a>
            </div>
            <div>
              <h2>Follow VLS</h2>
              <ul>{academy.socials.map(([name, url]) => <li key={name}><a href={url}>{name}</a></li>)}</ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} VLS Law Academy. All rights reserved.</p>
            <div><a href={academy.website}>Academy Website</a><a href={academy.privacy}>Privacy Policy</a></div>
          </div>
        </div>
      </footer>
      <PageInteractions />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structured).replace(/</g, '\\u003c') }} />
    </>
  );
}
