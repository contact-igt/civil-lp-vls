# Functional testing

Verified against the loopback production build on 26 November 2026 using Node.js 24.18.1 and Next.js 16.4.5. The lockfile installed cleanly with `npm ci`. ESLint, route type generation, TypeScript and the production build completed successfully.

| Check | Observed result |
| --- | --- |
| Lead creation and storage | A valid enquiry returned HTTP 201 after SQLite committed the Civil record. A read-only database check confirmed the normalised Indian mobile, lowercased email, non-Latin city, consent, server time and Civil course identifier. |
| Duplicate protection | Concurrent equivalent requests returned one 201 and one 200 with the same receipt. One row was stored. |
| Validation and spam controls | Invalid fields and missing consent returned HTTP 422 with six field messages. Cross-origin, incorrect content type, malformed or oversized JSON, and honeypot requests were rejected. Repeated requests produced HTTP 429 with `Retry-After`. |
| Delivery failure | An unavailable SQLite path, disabled production mode and missing webhook credentials each returned HTTP 503. |
| Production receipt contract | The webhook test used a mocked fetch and synthetic configuration. It checked the destination, bearer authentication and stable idempotency key. An HTTP error, unaccepted response and receipt for an unrelated course each failed. |
| Attribution | API tests verified five UTMs, click identifiers, landing URL, referrer origin, server timestamp and course identifier. An unrelated query parameter and referrer query were discarded. |
| Preview SEO | HTML and response headers carried `noindex, nofollow`. The robots file blocked crawling and the sitemap published zero URLs. The homepage contained Course and Organisation JSON-LD, a social image and the requested title. |

The four API suites passed after the supplied classroom imagery and sharing image were integrated. They started temporary loopback servers and used separate databases. The production adapter ran against a mock only. An approved Civil production endpoint, its credentials and a test receiver are still needed to validate live delivery. The current site uses an isolated local intake.

## Browser flow

The Chromium flow passed with the following checks.

- Header, hero and sticky enquiry links reached the expected sections. A second smoke check exercised About, FAQs and the privacy link. Curriculum and FAQ disclosures were keyboard-operable. The curriculum and contact fallback also rendered with JavaScript disabled.
- An empty form announced validation errors and moved focus to the first invalid field. An injected delivery failure showed the pending and failure states, preserved the values, and emitted no success event.
- Retrying sent the sanitised advertising parameters and received an actual SQLite confirmation. A second submission returned the duplicate receipt without firing a second conversion.
- The telephone and WhatsApp links had the verified destinations. Browser tests intercepted navigation before either app opened.
- The eight event names were exercised. The event payloads contained no form values and the default preview made no vendor requests.

Browser test submissions were synthetic and used reserved example addresses. The [responsive report](RESPONSIVE-QA.md) lists the viewport and engine results.

Run `npm test` against a built application. To repeat the browser flow, start the local preview and run `npm run test:browser`.
