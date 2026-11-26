# Responsive QA

Verified on 26 November 2026 against the loopback production build. Playwright 1.65.1 completed 20 browser and viewport combinations on macOS 27.2.1.

| Width | Chromium 159.0.8154.6 | WebKit 27.2 | Firefox | Hero CTA bottom in Chromium |
| ---: | --- | --- | --- | ---: |
| 320px | Pass | Pass | Unavailable | 458px |
| 360px | Pass | Pass | Unavailable | 433px |
| 375px | Pass | Pass | Unavailable | 435px |
| 390px | Pass | Pass | Unavailable | 435px |
| 430px | Pass | Pass | Unavailable | 409px |
| 768px | Pass | Pass | Unavailable | 464px |
| 1024px | Pass | Pass | Unavailable | 495px |
| 1280px | Pass | Pass | Unavailable | 552px |
| 1440px | Pass | Pass | Unavailable | 578px |
| 1920px | Pass | Pass | Unavailable | 586px |

Every tested viewport fit its width with no horizontal overflow. Each check covered the hero image source and size, CTA visibility and size, computed colour, navigation, collapsed and expanded disclosures, and the swap from the sticky CTA to the enquiry section. Page and failed request listeners reported zero errors during the viewport checks. The refreshed classroom imagery was visually reviewed in the full desktop, tablet and mobile pages and in first-screen captures at all ten widths. The new crops keep both instructor and learners in frame.

Visual review led to two changes at narrow sizes. The module label now stays together at 320px. The tablet form switches to a single column when its card is too narrow for the status label and option text. It uses two columns when the card has room for the full text.

The CTA computed to `rgb(178, 10, 10)` in every engine and viewport, matching the locked `#B20A0A` design token. White text on that red measures 7.14:1. Muted body text on paper measures 4.87:1. All tested header and course CTAs meet the 44px touch target requirement.

Chromium keyboard checks covered skip navigation, curriculum disclosure activation, and validation focus. Axe reported zero WCAG 2.1 A/AA violations across 29 automated rules at 390px and at 1440px. Native disclosures and the phone fallback also worked with JavaScript disabled. Physical-device iOS safe-area verification remains a staging check.

## Screenshots

- [Desktop full page](screenshots/desktop.png) · 1440×5006px
- [Tablet full page](screenshots/tablet.png) · 768×4796px
- [Mobile full page](screenshots/mobile.png) · 390×7003px

[First-screen captures for all ten widths](screenshots/viewports/) · [Computed browser results](browser-results.json)

Firefox’s Playwright binary exited before page execution because macOS could not access its profile folder. Both tested Playwright releases hit the macOS profile error. A separate temporary QA application identity also stalled before automation connected. The test script records this engine as unavailable. [Upstream Playwright issue](https://github.com/microsoft/playwright/issues/42768) · [Mozilla confirmation](https://bugzilla.mozilla.org/show_bug.cgi?id=2062988)
