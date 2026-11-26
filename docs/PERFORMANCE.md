# Performance measurements

Lighthouse 13.6.0 and headless Chrome 158 measured the production build with the supplied classroom photos on loopback on 26 November 2026. The mobile preset used a 412×823 emulated viewport and simulated network and CPU throttling. Desktop used the standard Lighthouse desktop preset. Analytics IDs were unset. The table uses medians for the three mobile runs and a single desktop run.

| Measurement | Mobile | Desktop | Target |
| --- | ---: | ---: | ---: |
| Lighthouse performance | 98 | 100 | 90+ |
| Lighthouse accessibility | 100 | 100 | 95+ |
| Lighthouse best practices | 100 | 100 | 95+ |
| Lighthouse SEO | 66 | 66 | 95+ after release |
| Largest Contentful Paint | 2.46 s | 0.57 s | ≤2.5 s |
| Cumulative Layout Shift | 0.0152 | 0.0002 | <0.1 |
| First Contentful Paint | 0.75 s | 0.21 s | |
| Total Blocking Time | 9 ms | 0 ms | |
| Total bytes reported | 264 KiB | 372 KiB | |

Mobile LCP ranged from 2.46 s to 2.49 s. Lighthouse’s only failing scored audit was crawlability. The preview sends `noindex, nofollow` and blocks crawling. Release SEO needs verification on the approved public URL.

A separate Playwright Chromium session recorded 8 synthetic interactions at 390×844 with 4× CPU throttling. Opening the curriculum and FAQ disclosures and navigating to admissions produced a longest interaction duration of **48 ms**. Event Timing used a 16 ms observation threshold. Field INP, LCP and CLS require representative production traffic and remain unmeasured.

The [measurement data](performance-results.json) includes each run, emulation settings and the interaction samples.
