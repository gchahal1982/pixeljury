# PixelJury state-of-the-art dossier

**Assessment date:** 2026-07-18 UTC
**Repository:** [`gchahal1982/pixeljury`](https://github.com/gchahal1982/pixeljury)
**Audited revision:** `8c8aaa0` (`vorflux/pixeljury-sota-20260718`; code is the same audited tree as the 2026-07-07 v0.1.5 release)
**Verdict:** **Not Yet SOTA**

## Executive verdict

PixelJury is an unusually focused **local, agent-oriented design-quality auditor for rendered AI-built frontends**. Its defensible novelty is not screenshot capture, pixel diffing, accessibility scanning, or performance auditing. It is the combination of: (1) deterministic rendered-page heuristics for usability and recognizable “AI slop,” (2) a public weighted design rubric, (3) pluggable vision-model judgment, and (4) an agent-ready remediation artifact. The implementation is compact and understandable, the current test suite passes, the dependency audit is clean, and local/BYO-provider operation is a meaningful privacy and adoption advantage.

It is not currently state of the art as a production visual-QA system. It has no baseline or branch model, image diff engine, configurable browser/viewport matrix, first-class CI gate, PR review workflow, broad WCAG engine, performance budgets, capture stabilization controls, longitudinal analytics, public calibration corpus, or demonstrated scoring reliability across models and repeated runs. Its two fixed Chromium captures and one-shot score are closer to an expert design lint than to Percy, Applitools, Chromatic, Argos, BackstopJS, or Playwright visual comparisons. Its accessibility checks are explicitly narrower than axe-core, WAVE, and Lighthouse. Those are critical-gate failures, so the required verdict is **Not Yet SOTA**.

A credible SOTA path is nevertheless available: do not rebuild every incumbent. Preserve PixelJury’s design-judgment and agent-remediation wedge, compose with Playwright and axe-core, add deterministic capture and CI contracts first, then add lightweight branch-aware evidence and calibration. The target category should be **agentic design-quality governance**, not generic visual regression.

## 1. Category and category boundary

### Primary category

**AI-assisted rendered-interface design QA and agentic remediation.** PixelJury evaluates whether a working frontend is visually intentional, usable, polished, and free of common generative-template tells, then emits a machine-consumable score and a fix prompt for a coding agent.

### Adjacent categories, not substitutes

- **Visual regression platforms:** Percy, Applitools Eyes, Chromatic, Argos, BackstopJS, reg-suit, and Playwright screenshot assertions answer “what changed from an approved baseline?” PixelJury currently answers “how good does this rendered page look against this rubric?”
- **Component testing:** Storybook testing and Chromatic specialize in isolated states, interactions, and component-scale review. PixelJury accepts a URL and has no story/component inventory.
- **Accessibility evaluation:** axe-core and WAVE provide much broader rules, semantics, and standards coverage. PixelJury implements a small rendered subset: contrast, touch target size, text size, overflow, and overlap.
- **Performance and quality budgets:** Lighthouse CI measures performance, accessibility, best practices, and SEO, and can enforce assertions. PixelJury does not measure runtime performance or resource budgets.
- **Human design review:** PixelJury attempts to structure part of aesthetic judgment, but it has no evidence that its score is equivalent to expert review or reliable enough to replace it.

**Positioning implication:** PixelJury should integrate with these systems and own the “design intent, anti-template originality, and agent repair” layer. Claims that it replaces accessibility, regression, component, or performance testing would be unsupported.

## 2. Repository evidence

The following findings were verified directly in the audited repository, not inferred from marketing copy.

| Evidence | Verified repository state | Consequence |
|---|---|---|
| Product/release | CLI package is `pixeljury@0.1.5`; changelog dates it 2026-07-07 ([`packages/cli/package.json`](../../packages/cli/package.json), [`CHANGELOG.md`](../../CHANGELOG.md)). | Real published early-stage product, not a design-only proposal. |
| Pipeline | `review` performs render → static analysis → vision score → compose → write ([`packages/cli/src/review.js`](../../packages/cli/src/review.js)). | Coherent end-to-end vertical slice. |
| Capture | Playwright launches Chromium, then takes full-page 1440×900 and 390×844 captures at DPR 1 ([`packages/core/src/render.js`](../../packages/core/src/render.js)). | Rendered evidence exists, but browser and viewport coverage are fixed. |
| Load stabilization | Navigation tries `networkidle`, falls back to `load`, then waits 800 ms. | Basic resilience only; no selector readiness, font wait, animation freeze, masks, clock/network control, retry policy, or per-page configuration. |
| Deterministic hard fails | Body text, 390 px overflow, text contrast, touch targets, and overlapping text are checked ([`packages/core/src/static-signals.js`](../../packages/core/src/static-signals.js)). | Useful smoke coverage; not broad accessibility conformance. |
| Deterministic style heuristics | Dominant default font, large gradient, emoji UI, accent-stripe cards, repeated cards, and AI-pill copy are checked. | Distinct anti-template signal, although heuristics can encode taste and need calibration. |
| Vision judgment | Seven adapters exist: OpenAI, Anthropic, Gemini, Ollama, Claude Code, Codex, and mock ([`packages/vision/src/index.js`](../../packages/vision/src/index.js)). | Strong provider portability and local/BYO option. |
| Output validation | Vision JSON is parsed to a fixed six-dimension shape; malformed output gets one stricter retry. | Better than unstructured prompting, but no cross-run/model reliability controls. |
| Score | Six weighted design dimensions, named deductions capped at 25, and deterministic hard-fail caps compose a 0–100 score ([`rubric.md`](../../rubric.md), [`packages/core/src/compose.js`](../../packages/core/src/compose.js)). | Transparent score mechanics; empirical validity remains **unverified**. |
| Artifacts | Writes desktop/mobile PNGs, `score.json`, `critique.md`, and `fix-prompt.md`. | Good local evidence and agent handoff. |
| CI | GitHub Actions installs dependencies and runs `npm test` on PRs and main. | Project code is tested, but PixelJury itself has no `--ci`, quality threshold, PR status, baseline approval, or Action. |
| Tests | 20 Node tests cover score composition, color math, synthetic static signals, vision schema/pipeline, and passthrough isolation. | Solid unit slice; actual Playwright render, CLI argument/error behavior, provider HTTP adapters, and golden visual outcomes lack automated coverage. |
| Privacy | Security policy says local operation, no backend/telemetry, and provider-selected image transfer; passthrough screenshots are staged in temporary directories. | Meaningful advantage; arbitrary-URL and screenshot-disclosure threat controls are still limited. |
| Planned work | Changelog explicitly says `fix`, `compare`, `report`, `--ci`, and GitHub Action are 0.2+ scope. | Core production workflows are acknowledged but absent today. |

### Current strengths

1. **Clear wedge:** anti-slop/originality judgment and agent-ready remediation are poorly served by baseline diff tools.
2. **Open rubric:** score mechanics and hard caps can be inspected and challenged.
3. **Hybrid signal model:** deterministic failures are separated from irreducibly visual model judgment.
4. **Low infrastructure burden:** no PixelJury backend, account, or hosted baseline store is required.
5. **Provider choice:** commercial APIs, local Ollama, authenticated local agent CLIs, and deterministic mock are supported.
6. **Small trusted surface:** 64 tracked files at audit time; local tests are fast; npm audit is clean.

### Material weaknesses and risks

1. **No benchmark validity:** no labeled corpus, expert panel, inter-rater agreement, repeated-run variance, provider comparison, false-positive/false-negative report, or score migration suite is published. Score validity is **unverified**.
2. **Mock ambiguity:** mock permits end-to-end operation but does not produce a model-backed visual critique. Machine consumers need explicit provenance and confidence so “mock score” cannot be mistaken for a real visual score.
3. **Fixed capture:** only Chromium and two hardcoded viewports are supported. The mobile run uses a Safari-like user agent in Chromium, not WebKit/Safari rendering.
4. **No comparison lifecycle:** no baseline, branch ancestry, approval, carry-forward, changed-region diff, or history.
5. **No deterministic gate contract:** JSON is available, but there is no supported threshold policy or documented exit-code contract for quality failures.
6. **Narrow accessibility:** custom checks do not cover names/roles, labels, alternatives, document language/title, landmarks, focus, ARIA validity, keyboard operation, or the wider WCAG 2.2 rules available in axe-core and WAVE.
7. **Capture noise:** animations, dates, randomized data, fonts, ads, requests, and async states can alter model judgment with no masks or deterministic fixtures.
8. **Taste and cultural bias:** rules such as penalizing named fonts or particular motifs may be useful for the target corpus but are not universal design defects. They need profile/version support and evidence.
9. **Security boundary:** a user can render arbitrary trusted URLs and send resulting screenshots to a provider. Redaction, allow/deny controls, private-network policy, and explicit data-flow provenance are absent.
10. **Maturity:** one GitHub star, 686 npm downloads in the latest measured 30-day window, version 0.1.5, and no public enterprise governance evidence. Adoption is early.

## 3. Primary-source competitor inventory and dated metrics

Eligibility was frozen before scoring at the 2026-07-18 cutoff: include products with current first-party documentation or a public repository/package artifact that materially cover at least one of rendered visual comparison, component visual review, accessibility evaluation, performance quality gates, or agent-oriented design critique. The inventory below contains every matching product identified by the repository/npm and first-party documentation scan; archived/stale alternatives remain listed but ineligible as primary targets. Design-to-code products without a stable comparable public artifact are adjacent and excluded, not silently scored. Metrics below were captured on **2026-07-18 UTC** from GitHub’s repository API and npm’s registry/download API. npm’s common download window is **2026-06-17 through 2026-07-16**. Downloads measure package retrieval, including CI/cache behavior; they are not unique users. GitHub stars measure repository interest, not product quality. Hosted-product revenue, active customers, retention, test volume, and private source maturity are **unverified** unless the vendor publishes auditable data.

| Product / role | Canonical public artifact | Latest package/release observed | 30-day npm downloads | GitHub stars | Primary-source capability evidence |
|---|---|---:|---:|---:|---|
| **PixelJury** — agentic design QA | [`gchahal1982/pixeljury`](https://github.com/gchahal1982/pixeljury) | `pixeljury` 0.1.5, 2026-07-08 | 686 | 1 | Audited repository and npm APIs [R1–R4]. |
| **Percy** — hosted visual regression/review | [`percy/cli`](https://github.com/percy/cli), [`@percy/cli`](https://www.npmjs.com/package/@percy/cli) | 1.32.4, 2026-07-14 | 2,257,143 | 85 | BrowserStack documents baseline comparison, branch-aware build selection, review/approval, PR status, SDKs, and browser rendering [P1–P3]. Public CLI is not the whole hosted system. Hosted internals: **unverified**. |
| **Applitools Eyes** — Visual AI and cross-environment rendering | [`@applitools/eyes-playwright`](https://www.npmjs.com/package/@applitools/eyes-playwright) | 1.47.11, 2026-07-08 | 170,824 | **unverified** canonical SDK-repo metric | Official docs describe baselines, branches, match levels, batch review, Playwright SDK, and Ultrafast Grid [A1–A3]. Closed service internals and vendor efficacy claims: **unverified**. |
| **Chromatic** — Storybook-centric visual/component review | [`chromaui/chromatic-cli`](https://github.com/chromaui/chromatic-cli), [`chromatic`](https://www.npmjs.com/package/chromatic) | 18.0.1, 2026-07-02 | 33,044,214 | 336 | Official docs cover visual baselines/review, Storybook integration, browser coverage, interaction/a11y tests, and TurboSnap [C1–C4]. Hosted internals: **unverified**. |
| **BackstopJS** — local OSS visual regression | [`garris/BackstopJS`](https://github.com/garris/BackstopJS) | 6.3.25, 2024-09-07 | 276,069 | 7,156 | README documents scenarios/viewports, reference/test/approve, mismatch thresholds, reports, scripts, Docker, and engines [B1]. Package has not published since 2024; maintenance trajectory should be reviewed before adoption. |
| **Storybook testing** — component-state test environment | [`storybookjs/storybook`](https://github.com/storybookjs/storybook) | 10.5.2, 2026-07-16 | 78,066,450 | 90,610 | Official docs cover interaction, accessibility, visual testing integrations, and the current Vitest addon; legacy test-runner is superseded for supported projects [S1–S4]. |
| **Playwright visual comparisons** — test-runner-native screenshots | [`microsoft/playwright`](https://github.com/microsoft/playwright), [`@playwright/test`](https://www.npmjs.com/package/@playwright/test) | 1.61.1, 2026-06-23 | 184,764,239 (`@playwright/test`) | 93,045 | Official docs specify `toHaveScreenshot`, snapshot update/threshold options, projects, retries, traces, and axe integration [W1–W4]. |
| **axe-core** — automated accessibility engine | [`dequelabs/axe-core`](https://github.com/dequelabs/axe-core) | 4.12.1, 2026-06-10 | 225,133,904 | 7,316 | Repository documents WCAG 2.0/2.1/2.2 A/AA/AAA and related standards and emphasizes that automated testing cannot prove conformance [X1–X3]. |
| **WAVE** — visual/manual accessibility evaluation and API | [WAVE](https://wave.webaim.org/), [extension](https://wave.webaim.org/extension/), [API](https://wave.webaim.org/api/) | Browser-extension version/date: **unverified** from first-party page | **unverified** canonical npm package | **unverified** canonical OSS repo | WebAIM documents rendered-page overlays, local extension analysis, code/structure/contrast views, and paid APIs [V1–V3]. |
| **Lighthouse CI** — performance/quality assertions | [`GoogleChrome/lighthouse-ci`](https://github.com/GoogleChrome/lighthouse-ci) | 0.15.1, 2025-06-26 | 5,148,611 | 7,016 | Official configuration documents collect/assert/upload, category/audit thresholds, budgets, temporary storage, and self-hosted server [L1–L3]. |
| **Argos** — OSS-client hosted visual review | [`argos-ci/argos-javascript`](https://github.com/argos-ci/argos-javascript), [`@argos-ci/cli`](https://www.npmjs.com/package/@argos-ci/cli) | 6.3.0, 2026-07-12 | 460,106 | 17 (SDK repo) | Official docs cover Playwright/Storybook capture, baselines, PR review, browser/state coverage, and traces [G1–G3]. Hosted internals: **unverified**. |
| **reg-suit** — composable OSS image comparison/reporting | [`reg-viz/reg-suit`](https://github.com/reg-viz/reg-suit) | GitHub 0.14.6, 2026-03-16; npm `reg-suit` 0.14.5 | 555,261 | 1,284 | README/plugins document sync, compare, publish, HTML reports, object storage, and GitHub/GitLab status workflows [R5–R7]. |

### Alternatives screened but not used as primary targets

- **Lost Pixel:** 1,685 GitHub stars; latest observed release 3.22.0 (2024-11-14); repository is archived. Relevant historical product, but not a current SOTA target.
- **Loki:** 1,907 stars; latest observed release 0.35.1 (2024-08-27); last observed push 2024-10-12. Relevant Storybook screenshot option; current maintenance and 2026 compatibility are **unverified**.
- **Cloud device farms and general E2E services:** BrowserStack, Sauce Labs, LambdaTest, Cypress Cloud, and similar systems matter for execution breadth, but a full inventory is outside this dossier’s design-QA scope.
- **Design-to-code products:** adjacent but ineligible for this frozen comparator set because no stable public artifact was identified that exposes comparable visual-QA/review measurements; this exclusion is a scope rule, not evidence that those products lack relevant private capabilities.

## 4. Weighted SOTA criteria

This model evaluates **coverage of the target agentic design-QA category**, not absolute product quality. Scores are 1 (absent/weak) to 5 (leading, documented capability), and `Σ(weight × score/5)` is diagnostic only. It cannot award SOTA; every critical gate and predeclared per-dimension non-inferiority test must pass.

| # | Criterion | Weight | Why it matters | SOTA evidence bar |
|---:|---|---:|---|---|
| 1 | Rendered design judgment | 10 | Detects hierarchy, coherence, polish, and final-pixel defects. | Validated pixel/DOM judgment with reproducible evidence and explainable regions. |
| 2 | Baselines and regression lifecycle | 12 | Turns one-time audit into change governance. | Branch-aware baselines, ancestry, approval, carry-forward, and history. |
| 3 | Browser, device, and viewport breadth | 7 | Real defects vary by engine and responsive state. | Configurable Chromium/Firefox/WebKit plus viewport/device matrix and parallelism. |
| 4 | Component and E2E integration | 6 | Coverage must include isolated states and real flows. | Storybook and Playwright/Cypress first-class integrations with state naming. |
| 5 | Accessibility depth | 10 | Design QA without semantics and WCAG breadth is incomplete. | axe-equivalent WCAG 2.2 rule coverage, guided/manual boundary, suppressions, provenance. |
| 6 | Performance and quality budgets | 6 | A polished page can still be slow or unstable. | Enforceable Lighthouse/Core Web Vitals/resource assertions or first-class composition. |
| 7 | AI-specific design critique | 12 | PixelJury’s intended differentiation. | Calibrated originality/template detection and rubric-based visual critique. |
| 8 | Actionable remediation and agent loop | 10 | Findings must reliably become fixes. | Structured, located, prioritized fixes; agent protocol; before/after verification. |
| 9 | CI gates and PR workflow | 9 | Adoption depends on review-time decisions. | Exit contracts, policies, PR status/comments, artifacts, approvals, and GitHub/GitLab support. |
| 10 | Determinism and flake control | 6 | Noisy visual evidence destroys trust. | Fonts/animations/time/network control, masks, retries, thresholds, flaky-test analytics. |
| 11 | Governance, history, and analytics | 5 | Teams need trends, ownership, waivers, and auditability. | Durable run history, score/rule versions, expiring waivers, ownership, trends. |
| 12 | Privacy, portability, and self-hosting | 4 | Screenshots can contain sensitive data. | Local/self-hosted path, redaction, data-flow controls, portable artifacts. |
| 13 | Maturity and ecosystem | 3 | Reliability includes support, docs, adoption, and release health. | Active maintenance, integrations, compatibility policy, broad use, and support evidence. |
|  | **Total** | **100** |  |  |

### PixelJury diagnostic score (reproducible)

The aggregate is a prioritization summary, not a promotion gate. Comparator products are not assigned numeric totals because this assessment did not predeclare statistical non-inferiority margins or collect reproducible measurements for every criterion. A future positive verdict must mechanically select the top three to five eligible comparators by documented criterion coverage, freeze their identities and evidence hashes, declare per-dimension margins and confidence treatment before execution, and pass every meaningful dimension against every selected comparator.

| # | PixelJury rating (1–5) | Weighted contribution | Evidence rationale |
|---:|---:|---:|---|
| 1 | 3.5 | 7.0 | Model rubric plus deterministic DOM/CSS findings, without calibration or region grounding. |
| 2 | 2.0 | 4.8 | One-shot artifacts exist, but no approved baseline or branch lifecycle. |
| 3 | 2.0 | 2.8 | Two fixed Chromium viewports; no Firefox/WebKit or configurable matrix. |
| 4 | 2.5 | 3.0 | Live-URL workflow only; no Storybook or test-runner adapter. |
| 5 | 2.5 | 5.0 | Narrow contrast/layout checks; no broad WCAG semantics engine. |
| 6 | 1.0 | 1.2 | No performance collection or enforceable budgets. |
| 7 | 4.0 | 9.6 | Distinct public anti-template rubric, but reliability is uncalibrated. |
| 8 | 3.0 | 6.0 | Prioritized fix prompt exists; locations and bounded repair loop do not. |
| 9 | 1.0 | 1.8 | Repository CI tests code, but no supported quality exit/PR policy. |
| 10 | 1.0 | 1.2 | Dynamic page and model variance are uncontrolled. |
| 11 | 1.0 | 1.0 | Local run files only; no durable governance/history. |
| 12 | 4.0 | 3.2 | Local/BYO-provider path is strong; redaction/network policy is absent. |
| 13 | 1.0 | 0.6 | Early release/adoption and small integration surface. |
|  |  | **47.2 / 100** | `Σ(weight × rating / 5)`; directly reproducible from this table. |

The **Not Yet SOTA** verdict does not depend on 47.2 or any arbitrary aggregate threshold. Seven explicit critical gates in §8 fail, including validation, deterministic policy, capture breadth, accessibility truth, review lifecycle, agent safety, and privacy controls.

## 5. Exhaustive feature matrix

Legend: **N** = native/documented; **I** = first-class documented integration; **P** = partial/narrow/manual; **—** = not present in reviewed evidence; **U** = **unverified**. “Exhaustive” means all features material to this dossier’s defined category, not every vendor SKU.

Abbreviations: **PJ** PixelJury, **Pe** Percy, **Ap** Applitools, **Ch** Chromatic, **Bs** BackstopJS, **Sb** Storybook testing, **Pw** Playwright, **Ax** axe-core, **Wa** WAVE, **LH** Lighthouse CI, **Ar** Argos, **Rs** reg-suit.

### Capture, comparison, and review

| Capability | PJ | Pe | Ap | Ch | Bs | Sb | Pw | Ax | Wa | LH | Ar | Rs |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Render a URL/page | N | N | N | P | N | P | N | I | N | N | N | — |
| Full-page screenshots | N | N | N | N | N | I | N | — | P | P | N | — |
| Configurable viewport matrix | — | N | N | N | N | N | N | — | P | P | N | — |
| Chromium/Firefox/WebKit coverage | — | N | N | N | P | I | N | I | P | P | N | — |
| Real-device coverage | — | I | I | — | — | — | P | — | P | P | P | — |
| Story/component capture | — | I | I | N | I | N | I | I | P | P | N | — |
| Interaction-state capture | — | I | N | N | N | N | N | I | P | N | N | — |
| Approved image baseline | — | N | N | N | N | I | N | — | — | — | N | N |
| Branch-aware baseline ancestry | — | N | N | N | P | I | P | — | — | — | N | N |
| Pixel/image diff | — | N | N | N | N | I | N | — | — | — | N | N |
| Perceptual/AI matching | P | N | N | P | — | — | — | — | — | — | P | — |
| Region ignore/masking | — | N | N | N | N | I | N | I | P | P | N | P |
| Human review UI | — | N | N | N | P | P | P | — | N | P | N | N |
| Explicit approve/reject workflow | — | N | N | N | N | I | P | — | — | — | N | I |
| Durable run/history view | — | N | N | N | P | P | P | — | P | N | N | I |
| Visual change location/overlay | — | N | N | N | N | I | N | — | N | — | N | N |
| Trace/DOM debugging evidence | P | N | N | N | P | N | N | N | N | N | N | P |

### Standards, intelligence, automation, and operations

| Capability | PJ | Pe | Ap | Ch | Bs | Sb | Pw | Ax | Wa | LH | Ar | Rs |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Broad WCAG automated rules | — | — | I | I | — | I | I | N | N | N | — | — |
| Rendered contrast check | N | — | N | N | — | N | I | N | N | N | — | — |
| Accessible-name/role/ARIA checks | — | — | N | N | — | N | N | N | N | N | P | — |
| Guided/manual accessibility inspection | — | — | N | P | — | N | P | P | N | P | — | — |
| Performance/Core Web Vitals audits | — | — | — | — | — | — | N | — | — | N | — | — |
| Enforceable performance/resource budgets | — | — | — | — | — | — | P | — | — | N | — | — |
| Aesthetic quality rubric | N | — | P | — | — | — | — | — | — | — | — | — |
| AI-template/originality detection | N | — | — | — | — | — | — | — | — | — | — | — |
| Deterministic design heuristics | N | — | P | — | P | — | P | N | N | N | P | P |
| Model-provider portability | N | — | — | — | — | — | — | — | — | — | — | — |
| Structured score artifact | N | N | N | N | N | N | N | N | N | N | N | N |
| Agent-ready fix prompt | N | — | P | — | — | — | — | — | P | — | — | — |
| Automated repair execution | — | — | U | — | — | — | — | — | — | — | — | — |
| Before/after agent verification loop | P | P | P | P | P | P | N | P | P | N | P | P |
| Quality-threshold process exit | — | N | N | N | N | N | N | N | I | N | N | N |
| PR commit status/check | — | N | N | N | I | I | I | — | — | N | N | I |
| Inline PR report/comment | — | N | N | N | I | I | I | — | — | N | N | I |
| GitHub Action or official CI recipe | P | N | N | N | N | N | N | N | I | N | N | N |
| Flake/noise controls | — | N | N | N | P | N | N | P | P | N | N | P |
| Versioned rules/config | P | N | N | N | N | N | N | N | N | N | N | N |
| Expiring suppressions/waivers | — | P | N | P | P | P | N | N | P | N | P | P |
| Local-only usable path | N | — | — | — | N | N | N | N | N | N | P | N |
| No mandatory vendor backend | N | — | — | — | N | N | N | N | P | N | — | N |
| Self-hosted evidence store | Files | — | U | — | Files | N | Files | N | P | N | — | N |
| Open-source core/client | N | N | SDK | N | N | N | N | N | P | N | N | N |
| Published calibration/benchmark corpus | — | U | U | U | — | — | N | N | P | N | U | — |
| Public score reliability evidence | — | U | U | U | — | — | N | N | P | N | U | — |

Notes:

- “N” does not imply equal depth. For example, PixelJury’s contrast implementation is a narrow custom check, while axe-core/WAVE/Lighthouse provide larger rule systems.
- Storybook visual baselines and hosted review are generally supplied through integrations such as Chromatic; those cells are marked **I** where appropriate.
- Playwright stores file baselines and offers rich runner controls, but branch ancestry and approvals are user-built, hence **P**.
- WAVE CI/PR behavior depends on paid APIs and user integration; it is marked **I/P**, not native hosted PR governance.
- Vendor AI efficacy, false-positive reduction, customer scale, uptime, enterprise controls, and automated-repair outcomes are **unverified** here.

## 6. Head-to-head conclusions

| Comparator | Where it is ahead of PixelJury | Where PixelJury is ahead or differentiated | Product decision |
|---|---|---|---|
| Percy | Baselines, branch selection, cross-browser rendering, approvals, PR status, review history, noise controls. | Open aesthetic rubric, anti-template critique, agent fix prompt, local/BYO provider. | Integrate/compose; do not recreate Percy’s cloud breadth in P0. |
| Applitools Eyes | Match modes, Visual AI comparison, Ultrafast Grid, branch baselines, review, broad SDK/device ecosystem, documented accessibility capability. | Vendor-neutral provider choice, local operation, inspectable anti-slop score, direct agent handoff. | Treat as enterprise benchmark; compete on openness and agent workflow, not render-grid scale. |
| Chromatic | Best-in-class Storybook state coverage, component baselines, browser snapshots, review/approval, TurboSnap, interaction/a11y integration. | Whole-page aesthetic judgment independent of Storybook and agent-specific remediation. | Add Storybook adapter; remain complementary. |
| BackstopJS | Simple local reference/test/approve loop, viewport/scenario configuration, image diff report, scripting. | Model-backed design critique, public quality rubric, structured remediation. | Borrow its local-baseline ergonomics, not its aging configuration surface wholesale. |
| Storybook testing | Component state inventory, interactions, Vitest browser execution, addon ecosystem, accessibility integration. | URL-level design coherence/originality judgment and one-command agent artifact. | Make stories an input source; do not become a component workbench. |
| Playwright visual comparisons | Cross-browser projects, stable test runner, screenshot assertions, thresholds, masks, retries, traces, fixtures, parallelism. | Opinionated design rubric and agent-oriented synthesis. | Use Playwright Test as the execution substrate rather than hand-building runner features. |
| axe-core | Standards/rules breadth, selectors and node evidence, tags, suppressions, integrations, mature automated accessibility semantics. | Aesthetic and responsive-layout judgment beyond axe’s purpose. | Embed or consume axe results; retire overlapping custom checks only where axe is stronger. |
| WAVE | Human-readable visual overlays, structure/order/code views, manual-review guidance, local extension and API options. | Repeatable CLI score and agent fix artifact. | Link to/ingest WAVE evidence where human review is required; do not claim equivalence. |
| Lighthouse CI | Collect/assert/upload workflow, performance and resource budgets, repeat runs, historical server, CI exit behavior. | Originality/design critique and targeted visual repair prompt. | Support a combined policy report; Lighthouse remains source of performance truth. |
| Argos | Modern Playwright/Storybook capture, branch baselines, hosted PR review, browser/state scale, traces. | Local/BYO model and anti-slop quality gate. | Strongest modern integration/reference candidate for teams that want hosted visual review. |
| reg-suit | Storage-pluggable baseline sync/compare/publish, reports, commit statuses, OSS composition. | Rendered design judgment and agent remediation. | Reference architecture for a backend-neutral baseline artifact protocol. |

**Central finding:** no eligible reviewed product natively combines PixelJury’s explicit anti-template design rubric and agent fix prompt with SOTA regression, accessibility, performance, and review governance. That is market whitespace, but whitespace is not proof of SOTA. PixelJury must demonstrate that its novel layer is valid, repeatable, and production-operable.

## 7. Standardized 13-dimension gap table

| Dimension | Current State | SOTA Target | Gap | Effort (S/M/L/XL) | Priority (P0-P3) |
|---|---|---|---|---|---|
| Rendered design judgment | Six model-scored dimensions plus deterministic DOM/CSS findings from desktop and mobile screenshots. | Region-grounded, explainable judgments validated against expert labels with repeatability/confidence data. | No grounding coordinates, benchmark, inter-rater agreement, provider variance, or calibrated confidence. | L | P0 |
| Baselines and regression lifecycle | One-shot artifacts; changelog says compare/report are future scope. | Branch-aware baselines, ancestry, approvals, carry-forward, changed-region diffs, and durable history. | Entire comparison and approval lifecycle is absent. | XL | P1 |
| Browser, device, and viewport breadth | Fixed Chromium at 1440×900 and 390×844; mobile is Chromium with a Safari-like UA. | Configurable Chromium, Firefox, WebKit, device profiles, viewport matrix, DPR, locale, theme, and parallel execution. | No configuration or actual cross-engine coverage. | L | P0 |
| Component and E2E integration | Accepts a live URL only. | First-class Playwright project/test and Storybook story/state adapters with stable names and metadata. | No component inventory, flow hooks, or interaction-state capture. | L | P1 |
| Accessibility depth | Custom contrast, touch-size, text-size, overflow, and overlap smoke checks. | axe-core WCAG 2.2 rules, ARIA/semantic evidence, suppressions, impact, and explicit manual-test boundary. | Most standards-based rules and semantic checks are absent; conformance cannot be inferred. | M | P0 |
| Performance and quality budgets | No performance collection or budgets. | Compose Lighthouse CI categories, audits, Core Web Vitals, and resource assertions into policy without duplicating Lighthouse. | No performance evidence or combined policy output. | M | P1 |
| AI-specific design critique | Public anti-slop rubric, six dimensions, seven providers, one parse retry. | Versioned profile system, labeled corpus, adversarial tests, provider normalization, stable score bands, and bias review. | Distinctive capability exists but empirical reliability and generalizability are unverified. | L | P0 |
| Actionable remediation and agent loop | Writes prioritized `fix-prompt.md`; rerun is manual. | Structured finding locations, remediation schema, agent protocol, bounded repair loop, patch evidence, and regression-safe verification. | Prompt lacks element/region IDs, confidence, machine-readable fix operations, and automated loop controls. | L | P1 |
| CI gates and PR workflow | Repository CI runs tests; CLI emits JSON but has no supported quality exit policy or Action. | `--ci` policy, deterministic exit codes, GitHub/GitLab checks, artifact links, annotations, approvals, and fork-safe secrets. | Production gate/review contract is absent. | M | P0 |
| Determinism and flake control | `networkidle`/`load` plus fixed 800 ms settle; model output may vary. | Ready selectors, font wait, frozen time/randomness, reduced motion, animation disable, request mocks, masks, retries, run variance, and flaky quarantine. | Dynamic-page and model variance are uncontrolled and unmeasured. | L | P0 |
| Governance, history, and analytics | Rubric v0.1 and changelog; each run writes local files. | Provenance-rich run manifest, score migration, trend history, owners, expiring waivers, rule telemetry, and audit log. | No durable governance beyond local artifacts and rubric version. | L | P1 |
| Privacy, portability, and self-hosting | Local/no telemetry; optional local providers; screenshots sent only to chosen cloud provider; arbitrary trusted URLs allowed. | Explicit data-flow manifest, redaction/masks, URL/private-network policy, retention controls, secret-safe CI, signed portable bundle. | Good architecture but no enforceable disclosure/redaction/network controls. | M | P0 |
| Maturity and ecosystem | v0.1.5, one star, 686 recent npm downloads, 20 tests, one CI job, Node 18+. | Compatibility matrix, integration ecosystem, end-to-end/golden tests, support policy, release automation, broad adoption, and operational evidence. | Early adoption and limited integration/reliability evidence. | L | P2 |

## 8. Critical gates

A **SOTA** verdict requires every gate below. Passing unit tests or having a unique feature cannot waive a failed gate.

| Gate | Pass condition | Current evidence | Status |
|---|---|---|---|
| G1: Validated judgment | Public representative corpus, expert labels, inter-rater baseline, model/run variance, false-positive analysis, and versioned score migration. | Examples show before/after, but no calibration study or benchmark. | **FAIL** |
| G2: Deterministic production policy | Supported quality policy and exit codes distinguish tool error, model unavailable, hard fail, score threshold, and accepted waiver. | JSON output only; no `--ci` or policy contract. | **FAIL** |
| G3: Stable capture breadth | Configurable multi-engine/viewport capture with deterministic state controls and documented reproducibility. | Two fixed Chromium captures and 800 ms settle. | **FAIL** |
| G4: Accessibility truth boundary | Standards engine integration plus explicit automated/manual limits; no unsupported conformance claim. | Narrow custom smoke checks; README correctly says it is not a full replacement. | **FAIL** |
| G5: Review and evidence lifecycle | Baseline/change evidence, branch/PR context, approvals or waivers, provenance, and durable artifact identity. | One-shot local outputs. | **FAIL** |
| G6: Agent safety and verification | Findings are grounded; repairs are bounded; rerun verifies no regression; uncertain findings do not silently block/repair. | Human hands `fix-prompt.md` to an agent; no bounded protocol or location grounding. | **FAIL** |
| G7: Privacy/security controls | Explicit provider disclosure, redaction, URL/network policy, secret-safe CI path, and artifact retention controls. | Local architecture and warnings are good; enforceable controls are missing. | **FAIL** |
| G8: Basic release health | Relevant tests pass, dependency audit is clean, version/docs/security policy exist. | Fresh 20/20 tests and 0-vulnerability audit; release/docs/security files present. | **PASS** |

**Gate result: 1 passed, 7 failed → Not Yet SOTA.**

## 9. Concrete P0 implementation paths

### P0.1 — Define a deterministic run and CI contract

**Outcome:** PixelJury becomes safely gateable before gaining more features.

1. Add a versioned run manifest and JSON Schema containing tool/rubric/config versions, Git SHA/branch, URL origin (redacted where needed), capture environment, browser revision, viewport, provider/model, whether scoring is mock, timestamps/durations, and artifact hashes.
2. Add `--ci`, `--min-score`, `--max-hard-fails`, `--max-deductions`, `--require-vision`, `--policy <file>`, and `--output-json <file>` with documented precedence.
3. Reserve stable exit codes: success, policy failure, invalid config, capture failure, provider failure, malformed result, and security-policy rejection. Never turn provider failure into a passing mock score when `--require-vision` is set.
4. Make every finding structured: stable rule ID/version, severity, confidence, viewport, selector/DOM fingerprint where deterministic, screenshot region where available, evidence, remediation, and suppression key.
5. Publish a minimal GitHub Action that uploads the evidence bundle and summary while remaining fork-safe. Start with artifacts/status; defer hosted review.
6. Test CLI parsing, exit codes, mock-vs-vision provenance, policy precedence, malformed configs, and golden JSON compatibility.

**Acceptance:** CI can reproducibly answer pass/fail without parsing prose, and a reviewer can determine exactly what generated the decision.

### P0.2 — Compose with axe-core instead of expanding ad hoc accessibility rules

**Outcome:** Accessibility evidence becomes standards-grounded while retaining PixelJury’s rendered-layout checks.

1. Integrate the current audited release line (`axe-core` 4.12.1 as of 2026-07-18) through Playwright after each configured state is ready.
2. Preserve PixelJury-specific overflow/overlap/design checks; map or de-duplicate contrast/touch findings where axe has stronger evidence.
3. Emit axe rule ID, WCAG tags, impact, help URL, target selector, related nodes, viewport/state, and engine version.
4. Support include/exclude scopes and versioned suppressions with owner, rationale, created date, and mandatory expiry.
5. State in CLI/report output that automated checks cannot prove WCAG conformance and list required manual categories.
6. Add fixtures for names/labels, alt text, language, landmarks/headings, ARIA validity, contrast, target size, and intentional incomplete/manual outcomes.

**Acceptance:** PixelJury catches the standard high-impact axe classes, identifies source nodes, and never reports “WCAG compliant” from automation alone.

### P0.3 — Build a reproducible capture configuration on Playwright Test primitives

**Outcome:** repeated evidence is stable enough to gate.

1. Introduce `pixeljury.config.{js,ts,json}` with named targets/states, URL, browser projects, viewports/devices, color scheme, locale/timezone, DPR, storage state, headers, readiness selector/function, and settle policy.
2. Before capture, wait for `document.fonts.ready`, set reduced motion, disable CSS/Web Animations, freeze time/random data through init scripts where configured, and provide request blocking/mocking hooks.
3. Add selectors/regions for masks, ignores, sensitive redaction, and crop scopes. Persist both original permitted evidence and redacted provider input hashes when policy allows.
4. Run Chromium first; add Firefox/WebKit behind the same state contract. Do not label a Chromium UA override “Safari.”
5. Add retries only around classified transient capture errors, record every attempt, and fail as flaky if attempts disagree beyond policy.
6. Add actual-browser integration tests using local deterministic fixtures for fonts, animation, delayed content, overflow, auth state, and multi-viewport behavior.

**Acceptance:** three runs of every deterministic fixture produce identical structured findings and pixel hashes (or documented bounded differences) on supported CI images.

### P0.4 — Establish the design-judgment benchmark

**Outcome:** the differentiator becomes evidence, not assertion.

1. Create a license-safe corpus stratified by application type, design system, aesthetic, locale, viewport, quality level, and common AI-template patterns. Keep a hidden holdout set.
2. Recruit multiple qualified design/accessibility reviewers. Capture per-dimension scores, defect regions, severity, confidence, and recommended fixes; measure inter-rater agreement.
3. Evaluate every supported provider/model and repeated runs for correlation, variance, pairwise ranking accuracy, hard-fail precision/recall, demographic/style bias, and prompt-injection robustness.
4. Calibrate score bands and weights to outcomes. A provider normalization layer may be required; do not imply scores from different models are interchangeable until measured.
5. Convert validated cases into versioned golden regression tests. Publish methodology, aggregate results, known blind spots, and score-migration notes without leaking restricted screenshots.
6. Split universal usability failures from configurable taste profiles. Font/motif penalties should be profile rules, not universal defects, unless evidence supports them.

**Acceptance:** a public report shows meaningful agreement with expert judgments, bounded repeated-run variance, and documented failure modes on a representative holdout.

### P0.5 — Harden the screenshot and URL data boundary

**Outcome:** users can reason about what leaves their machine.

1. Default to an explicit origin policy: localhost permitted for development; remote/private-network origins require policy acknowledgement; `file:`, browser-internal, and unsafe schemes rejected.
2. Add `--local-only` and policy modes that reject cloud providers, plus preflight output naming the selected provider/model and artifacts to be transmitted.
3. Apply configured redaction before cloud upload; detect likely secrets/PII in DOM metadata where feasible; never include cookies, storage state, headers, or full source in reports.
4. Define temporary-file permissions and deletion behavior for all adapters; test cleanup on success, parse retry, timeout, and interruption.
5. Document provider retention as **unverified/vendor-controlled** unless a selected provider contract proves otherwise.
6. Threat-model prompt injection embedded in page text, malicious image content, intranet capture, symlink/path traversal, oversized pages, and resource exhaustion.

**Acceptance:** security tests demonstrate blocked unsafe schemes, policy-controlled private origins/providers, deterministic redaction, and cleanup with no secrets in output.

## 10. Concrete P1 implementation paths

### P1.1 — Add a backend-neutral baseline and evidence protocol

Use content-addressed image/manifest blobs with pluggable local filesystem, GitHub artifact, S3-compatible, or reg-suit-style object-store adapters. Model baseline keys from target/state/browser/viewport/theme/locale/rubric profile. Resolve PR ancestry explicitly, never by “latest run.” Produce pixel/perceptual diff regions, but keep PixelJury’s design score as a separate signal: “changed” and “bad” are not synonyms. Add approve/reject and expiring waiver records signed by actor/time/reason.

### P1.2 — Ground remediation and define the agent protocol

Attach deterministic findings to selectors and boxes; require model findings to return regions and evidence phrases, then verify those regions exist. Emit a `fix-plan.json` alongside prose. Define bounded iteration count, allowed files/commands, stop conditions, minimum improvement, regression checks, and escalation on uncertain or contradictory findings. Store before/after manifests and explain score movement by finding—not merely total score.

### P1.3 — Add Storybook and Playwright adapters

For Storybook, ingest the index, story ID, args, globals, theme, locale, and `play` completion; preserve stable story/state names. For Playwright, expose a fixture/assertion or reporter that receives authenticated state and captures at test-defined checkpoints. Avoid a second test runner. Shard states and cache unchanged targets only when dependency evidence is trustworthy.

### P1.4 — Compose a unified policy report

Allow optional imports from axe-core, Lighthouse CI, Playwright screenshot assertions, and hosted visual-review URLs. PixelJury should aggregate provenance and policy, not fork those engines. A report should separate: accessibility violations, performance budget failures, baseline changes awaiting approval, deterministic usability failures, and aesthetic recommendations.

### P1.5 — Add governance and score evolution

Introduce rubric profiles, semantic rule versions, owner/expiry suppressions, migration fixtures, trend export, and a compatibility policy. Never compare historical totals across rubric/provider changes without normalization or an explicit break marker. Add SARIF or Checks annotations for grounded deterministic findings and a stable evidence-bundle format for other UIs.

## 11. Roadmap

| Phase | Indicative window | Deliverables | Exit evidence |
|---|---|---|---|
| 0. Contract | Weeks 0–3 | Run manifest/schema, policy file, stable exit codes, explicit mock/provider provenance, CLI tests. | Golden CLI/JSON tests; deterministic policy behavior on Linux/macOS. |
| 1. Trust floor | Weeks 2–6 | axe-core composition, accessibility boundary, origin/provider policy, redaction/masks, temp cleanup hardening. | Accessibility fixtures; threat model; security tests; no unsupported compliance claims. |
| 2. Stable capture | Weeks 4–10 | Config, named states, fonts/animations/time/network controls, Chromium/Firefox/WebKit projects, browser integration fixtures. | Three-run reproducibility report and classified flake rate. |
| 3. Validity | Weeks 4–14 | Labeled corpus, expert study, provider/run evaluation, calibrated weights/bands, profile split, golden suite. | Public benchmark report with holdout results and limitations. |
| 4. CI/PR | Weeks 8–14 | GitHub Action/check summary, artifact bundle, fork-safe secret behavior, annotations, waivers. | End-to-end PR fixtures and documented exit/status contract. |
| 5. Regression evidence | Months 4–7 | Content-addressed baseline protocol, ancestry, image regions, approvals, local/S3 adapters. | Branch/merge/approval conformance suite and migration tests. |
| 6. Agentic workflow | Months 5–9 | Grounded `fix-plan.json`, bounded repair loop, Storybook/Playwright adapters, unified policy import. | Measured fix success, regression rate, cost, latency, and human override rate. |
| 7. SOTA reassessment | Month 9+ | Independent benchmark rerun, ecosystem/adoption evidence, compatibility/security review. | All §8 gates pass and weighted score is at least 80. |

Timelines are engineering estimates, not commitments. Cross-browser execution, benchmark labeling, and baseline ancestry are likely critical-path work.

## 12. Fresh validation evidence

Validation was run from the audited branch on **2026-07-18 UTC** before this dossier was written.

```text
$ npm test
# tests 20
# pass 20
# fail 0
# cancelled 0
# skipped 0
# todo 0
```

Coverage represented by those 20 tests:

- score weighting, deduction cap, hard-fail cap, and static/vision de-duplication;
- color parsing/contrast and large-text ratio thresholds;
- synthetic static finding detection and clean-page behavior;
- Claude Code and Codex screenshot staging/isolation;
- mock pipeline composition;
- vision JSON parsing, repair/default behavior, and malformed-output rejection.

Not represented: real Chromium render tests, Firefox/WebKit, CLI exit/error contracts, HTTP provider adapters, accessibility engine breadth, visual baselines, PR workflows, or calibrated aesthetic outcomes.

```text
$ npm audit --json
vulnerabilities: info 0, low 0, moderate 0, high 0, critical 0, total 0
production dependencies: 9
```

Thus the requested fresh validation result is **20 passed, 0 failed, audit 0**. This proves the checked implementation paths currently pass; it does not prove SOTA behavior or broad production reliability.

## 13. Provenance, evidence quality, and staleness

### Evidence grades

- **Grade A — direct audited evidence:** files and commands in the PixelJury repository; fresh local test/audit output.
- **Grade B — primary public evidence:** official vendor/project documentation, GitHub repository/API, npm registry/download API, and official release pages.
- **Grade C — analyst inference:** weighted scores, effort estimates, prioritization, category boundary, and roadmap. These are explicitly judgments, not vendor facts.
- Third-party comparison blogs were not used as factual support where first-party evidence was available.

### Staleness rules

1. Repository facts are valid for audited revision `8c8aaa0`; re-audit after code or rubric changes.
2. npm/GitHub metrics are point-in-time observations captured 2026-07-18; downloads cover 2026-06-17 through 2026-07-16. Refresh monthly if used externally.
3. Hosted product docs can change without a source commit. Recheck Percy, Applitools, Chromatic, WAVE, and Argos claims immediately before procurement or public comparative marketing.
4. Prices, enterprise SKUs, SLAs, customer counts, proprietary model architecture, vendor-reported speed/false-positive improvements, data retention, and security certifications are **unverified** in this dossier.
5. A package’s npm downloads can include transitive installs and automation; stars can be stale or socially driven. Neither establishes adoption quality.
6. “Latest” refers to the artifact observed on the assessment date. BackstopJS, Lighthouse CI, Loki, and Lost Pixel cadence observations may change.
7. Accessibility standards and engine rules evolve. Pin and report exact axe/Lighthouse versions per run; automation never establishes complete WCAG conformance.

### Primary-source ledger

**PixelJury and metrics**

- **[R1]** PixelJury repository and audited source: <https://github.com/gchahal1982/pixeljury>
- **[R2]** PixelJury npm metadata: <https://registry.npmjs.org/pixeljury>
- **[R3]** PixelJury npm downloads: <https://api.npmjs.org/downloads/point/2026-06-17:2026-07-16/pixeljury>
- **[R4]** GitHub repository API: <https://api.github.com/repos/gchahal1982/pixeljury>
- **[R5]** reg-suit repository/README: <https://github.com/reg-viz/reg-suit>
- **[R6]** reg-suit GitHub notification plugin: <https://github.com/reg-viz/reg-suit/tree/master/packages/reg-notify-github-plugin>
- **[R7]** reg-suit release/API: <https://api.github.com/repos/reg-viz/reg-suit/releases/latest>

**Percy**

- **[P1]** Percy visual testing basics: <https://www.browserstack.com/docs/percy/overview/visual-testing-basics>
- **[P2]** Percy documentation: <https://www.browserstack.com/docs/percy>
- **[P3]** Percy CLI repository: <https://github.com/percy/cli>

**Applitools**

- **[A1]** Eyes for Playwright introduction: <https://applitools.com/docs/eyes/playwright/introduction>
- **[A2]** Eyes Playwright core concepts: <https://applitools.com/docs/eyes/playwright/core-concepts>
- **[A3]** Eyes platform overview: <https://applitools.com/platform/eyes/>

**Chromatic**

- **[C1]** Chromatic visual tests: <https://www.chromatic.com/docs/visual/>
- **[C2]** Chromatic documentation: <https://www.chromatic.com/docs/>
- **[C3]** Chromatic accessibility testing: <https://www.chromatic.com/docs/accessibility/>
- **[C4]** Chromatic CLI repository: <https://github.com/chromaui/chromatic-cli>

**BackstopJS**

- **[B1]** BackstopJS repository/README: <https://github.com/garris/BackstopJS>

**Storybook**

- **[S1]** Storybook testing overview: <https://storybook.js.org/docs/writing-tests>
- **[S2]** Interaction testing: <https://storybook.js.org/docs/writing-tests/interaction-testing>
- **[S3]** Accessibility testing: <https://storybook.js.org/docs/writing-tests/accessibility-testing>
- **[S4]** Visual testing: <https://storybook.js.org/docs/writing-tests/visual-testing>

**Playwright**

- **[W1]** Visual comparisons/test snapshots: <https://playwright.dev/docs/test-snapshots>
- **[W2]** Projects/browser configuration: <https://playwright.dev/docs/test-projects>
- **[W3]** Accessibility testing with axe: <https://playwright.dev/docs/accessibility-testing>
- **[W4]** Playwright repository/releases: <https://github.com/microsoft/playwright>

**axe-core**

- **[X1]** axe-core repository: <https://github.com/dequelabs/axe-core>
- **[X2]** axe-core rule descriptions: <https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md>
- **[X3]** axe-core accessibility support statement: <https://github.com/dequelabs/axe-core/blob/develop/doc/accessibility-supported.md>

**WAVE**

- **[V1]** WAVE product: <https://wave.webaim.org/>
- **[V2]** WAVE browser extension: <https://wave.webaim.org/extension/>
- **[V3]** WAVE API: <https://wave.webaim.org/api/>

**Lighthouse/Lighthouse CI**

- **[L1]** Lighthouse overview: <https://developer.chrome.com/docs/lighthouse/overview>
- **[L2]** Lighthouse CI repository: <https://github.com/GoogleChrome/lighthouse-ci>
- **[L3]** Lighthouse CI configuration: <https://github.com/GoogleChrome/lighthouse-ci/blob/main/docs/configuration.md>

**Argos**

- **[G1]** Argos visual testing: <https://argos-ci.com/visual-testing>
- **[G2]** Argos Playwright integration: <https://argos-ci.com/playwright>
- **[G3]** Argos Storybook documentation: <https://argos-ci.com/docs/storybook>

**Point-in-time metric APIs**

- GitHub repository endpoints follow `https://api.github.com/repos/{owner}/{repo}`; release endpoints append `/releases/latest`.
- npm metadata endpoints follow `https://registry.npmjs.org/{encoded-package}`.
- npm download endpoints follow `https://api.npmjs.org/downloads/point/2026-06-17:2026-07-16/{encoded-package}`.

## Final determination

PixelJury has a credible, differentiated product thesis and a healthy small implementation. It is strongest where incumbent regression and standards tools are weakest: explicit judgment of generic AI-produced visual design and direct translation into an agent’s repair instructions. It should preserve that wedge and become the orchestration/evidence layer over Playwright, axe-core, Lighthouse CI, and optional baseline providers.

Today, however, its novel score is uncalibrated, its capture is narrow and unstable relative to visual-testing leaders, and the production governance loop is missing. Seven of eight critical gates fail. Therefore the evidence-based verdict as of **2026-07-18** is:

# **Not Yet SOTA**

Reconsider only after all critical gates pass—especially public judgment validation, deterministic capture/policy, standards-based accessibility composition, review evidence lifecycle, and safe bounded agent verification.
