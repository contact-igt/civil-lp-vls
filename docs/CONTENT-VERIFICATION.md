# Content verification

Reviewed 26 November 2026.

## Module and page copy

The Taxation Law reference repository contains the original VLS Decoding of Practice brochure. PDF pages 3–4 identify Module 02 as Civil Procedure and Civil Trial and list all five units. The copy at `references/Updated-Vls-Brochure.pdf` matches the local academy copy with SHA-256 `ab3dd9c81a051c15b4433d03e7a3d04548dc865bac3462563c399e837894c68f`. The units in `lib/course.ts` group and paraphrase the listed topics for readability. They consolidate repeated entries in Unit 04 and use current wording for the brochure’s reference to persons of unsound mind. [Original VLS brochure](https://github.com/contact-igt/vls-taxations-law/blob/6d774b5/references/Updated-Vls-Brochure.pdf)

| Page content | Evidence and treatment |
| --- | --- |
| Civil Procedure Code, Civil Trial, Execution, Types of Civil Suits, Civil Rules of Practice | All five units and their topic coverage follow the brochure. |
| Legal notice through execution | Editorial summary of the brochure topics. The diagram labels the sequence illustrative and acknowledges procedural variation. |
| Audience and learning objectives | Based on the Civil Module brief and the academy’s programme positioning. |
| Academy and admissions | Official VLS site and programme material support the Chennai location, phone, email, WhatsApp, privacy link and social accounts. |
| Classroom imagery | The supplied Civil Module asset archive identifies general VLS academy imagery. The three selected classroom photos are attributed at academy level. |
| Learner testimonials | The video is the academy’s programme-level testimony. The page links directly to the original source and identifies the wider Decoding of Practice programme. |
| Upcoming batch and fee | The brief authorises enquiries. Current dates, timings, duration, fee, mode, language, batch faculty and any certificate details are unconfirmed. Commercial fields remain empty. |
| Assessment | Prior full-programme prototype and repository searches provided no approved Civil-specific bank. Its sample banks cover other topics or await an owner answer key. |

[Official academy site](https://www.vlslawacademy.com/) · [Admissions contacts](https://www.vlslawacademy.com/contact) · [Official programme](https://decodingofpractice.vlslawacademy.com/) · [Learner video](https://www.youtube.com/watch?v=qaxU1MBhhGc) · [Privacy policy](https://www.vlslawacademy.com/privacy-policy)

## Live references

The academy, original programme, Family Law, AI for Advocates, Business Law and Consumer Protection sites returned HTTP 200 on direct inspection. Property Law was available in a search crawl while the live origin returned HTTP 402. Constitutional Law also returned HTTP 402. DRT, Economic Laws and Taxation reference hostnames did not resolve in the direct check. Their repository snapshots provided the source material for inspection.

## Repository research

All fourteen public repositories were cloned into an isolated read-only temporary directory. GitHub metadata and package manifests were checked across the set, with deeper source review in the programme and individual module references.

| Repository | Snapshot | Review |
| --- | --- | --- |
| [vls-law-practice](https://github.com/contact-igt/vls-law-practice) | `e707f0e` | Original programme layout, Button and global styles, academy assets, waitlist, tracking and form pattern |
| [vls-property-law-frontend](https://github.com/contact-igt/vls-property-law-frontend) | `be6379c` | Single-module structure, brand red and course-specific register route |
| [vls-family-law-frontend](https://github.com/contact-igt/vls-family-law-frontend) | `6ff8862` | Module structure, brand red, classroom asset and course-specific register route |
| [vls-business-law](https://github.com/contact-igt/vls-business-law) | `fdd5133` | Asset manifest, editorial styling, tokens and classroom source library |
| [vls-ai-for-advocates](https://github.com/contact-igt/vls-ai-for-advocates) | `f064845` | Published institutional identity, logo, portrait and older visual system |
| [vls-constitutional-law](https://github.com/contact-igt/vls-constitutional-law) | `43b1ad6` | Compact single-course section and curriculum organisation |
| [vls-practice-ai-assisted-ads-form](https://github.com/contact-igt/vls-practice-ai-assisted-ads-form) | `66d31e9` | Attribution, enquiry UI, form submission, payment and response boundaries |
| [vls-taxations-law](https://github.com/contact-igt/vls-taxations-law) | `6d774b5` | Original brochure and academy editorial reference |
| [vls-aibe-frontend](https://github.com/contact-igt/vls-aibe-frontend) | `96a779a` | Build and course-site conventions |
| [vls-consumer-protection-law](https://github.com/contact-igt/vls-consumer-protection-law) | `2e695f5` | Course-site structure and classroom asset lineage |
| [vls-economic-law](https://github.com/contact-igt/vls-economic-law) | `6a5dacf` | Editorial section structure and framework conventions |
| [vls-mact-masterclass](https://github.com/contact-igt/vls-mact-masterclass) | `9fbfae3` | Course campaign conventions |
| [vls-practice-ai-assisted](https://github.com/contact-igt/vls-practice-ai-assisted) | `f5efff0` | Programme campaign and enquiry conventions |
| [vls-sivakumarlawassociate-frontend](https://github.com/contact-igt/vls-sivakumarlawassociate-frontend) | `0dfb636` | Related organisation’s public project structure |

The Civil page uses `#B20A0A` from Decoding of Practice, Property Law and Family Law. The Business Law reference informs paper, ink, imagery and typography. The 6/10 design variance comes from a split hero, a distinct litigation diagram and alternating editorial and photo sections. The 3/10 motion uses short press and hover transitions and supports reduced motion. The 5/10 density comes from compact disclosures, shared gutters and eight content sections. The page uses these patterns and native controls from the reviewed project-local Ponytail, Taste and Emil design guidance and the OpenAI Sites presentation-led guidance. It follows the Next.js 16.4.5 App Router documentation bundled with the locked installation. [Programme CSS](https://github.com/contact-igt/vls-law-practice/blob/e707f0e/src/styles/globals.css) · [Property CSS](https://github.com/contact-igt/vls-property-law-frontend/blob/be6379c/src/styles/globals.css) · [Family CSS](https://github.com/contact-igt/vls-family-law-frontend/blob/6ff8862/src/styles/globals.css) · [Business design system](https://github.com/contact-igt/vls-business-law/blob/fdd5133/references/DESIGN_SYSTEM.md)
