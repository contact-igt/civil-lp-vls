# VLS Law Academy · Civil Procedure & Civil Trial

A standalone, enquiry-first landing page for Module 02 of Decoding of Practice. It uses the Next.js App Router, TypeScript, Tailwind CSS v4, self-hosted Inter and Georgia. The programme content is server-rendered. Native disclosures work with JavaScript disabled.

## Local review

Use Node.js 24 or later.

```sh
npm ci
npm run build
npm run preview
```

The production-build preview listens on [127.0.0.1:3102](http://127.0.0.1:3102/). Use synthetic contact details for test submissions. The browser confirms an enquiry only once the loopback-only SQLite intake commits it. The default test database is `.data/civil-enquiries.sqlite`. `npm run dev -- --port 3102` starts the development server.

## Source and operation

| Location | Purpose |
| --- | --- |
| `app/page.tsx` | Eight-section landing page and structured data |
| `lib/course.ts` | Programme, verified contact details, commercial fields and syllabus |
| `app/tokens.css` | Locked visual tokens, including `#B20A0A` |
| `app/api/enquiry/route.ts` | Same-origin JSON intake, validation, rate limiting and receipt handling |
| `lib/enquiry-storage.ts` | Local SQLite storage and optional production webhook |
| `lib/analytics.ts` | First-party course event queue and configurable vendors |
| `.env.example` | Local setup and production configuration keys |

The local intake normalises Indian mobile numbers to `+91`. It treats the same normalised mobile and email for this course as a duplicate for 24 hours. SQLite serialises concurrent inserts, and a duplicate returns the original receipt without a new conversion event. Local records older than seven days are purged during subsequent valid writes. The default database directory is ignored by Git. Use a private directory when overriding `CIVIL_LEAD_DB` and remove test data when review is complete.

The API captures a server-side submission time and course identifier. It stores allowlisted campaign parameters and click identifiers, a sanitised landing URL, and the referrer origin. Analytics events use the course ID and non-personal event details. Third-party scripts need explicitly configured IDs. A configured GTM container takes precedence over direct GA4 and Meta Pixel. See the release checklist for the webhook receipt contract and vendor configuration checks.

## Verification

```sh
npm run lint
npm run typecheck
npm run build
npm test

npx playwright install chromium firefox webkit
npm run preview
# In another terminal:
npm run test:browser
```

The API tests use isolated temporary servers and databases. The browser test expects the loopback preview and uses reserved example email addresses. It saves full-page Chromium captures at 390, 768 and 1440px and viewport captures at every requested width. Use `CIVIL_QA_URL` to point the browser suite at a different loopback port. `CIVIL_QA_BROWSERS` selects engines and `CIVIL_QA_OUTPUT` changes the screenshot directory.

- [Content verification](docs/CONTENT-VERIFICATION.md)
- [Asset provenance](docs/ASSET-PROVENANCE.md)
- [Responsive QA](docs/RESPONSIVE-QA.md)
- [Functional test report](docs/FUNCTIONAL-TESTING.md)
- [Performance measurements](docs/PERFORMANCE.md)
- [Production release checklist](docs/PRODUCTION-RELEASE.md)
