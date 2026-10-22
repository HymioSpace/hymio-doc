# Asset provenance

## Site identity

- `docs/public/brand/hymio.svg`: existing organization mark from Hymio's `apps/client/public/hymio.svg`.
- `docs/public/brand/otter.png`: existing mascot from Hymio's `packages/ui/src/assets/app-icon.png`.
- `maintainers/brand/explorations.png`: AI-generated identity exploration from the first draft, using the existing otter as a reference. Kept as a maintainer design note; not part of the built manual.

## Product screenshots

`docs/public/screenshots/hymio-{home,tasks,conversation}.png` were captured from the running local Hymio Web client on 2026-10-22 with an isolated documentation account.

- Home and task details show synthetic records created through the actual product data layer.
- Conversation shows a real request and the configured model's actual reply. No chat fixture or generated mockup was used.
- The UI uses the current Chinese localization. English captions say so.
- No personal account, deployment configuration, bearer token, host address or existing user conversation is shown. The screenshot login was revoked afterward.

The site uses system fonts and no third-party stock imagery. Asset licensing remains a maintainer decision; this provenance record does not assign new licensing terms.

## Native and cross-device cases

Additional `hymio-ios-*.png` and `hymio-web-*.png` screenshots were captured on 2026-10-22 from the running native iOS simulator and Web app with a separate documentation account. They cover conversation continuity, shared model selection, a synthetic travel-note attachment, scheduled/completed tasks and a model-produced native UI card. The original Web examples remain available in the galleries.

`hymio-admin-grant.png` shows the real admin frontend against an isolated local database with a synthetic target account. No cloud computer was provisioned. The screenshot is framed around resource totals and capacity, excluding account rows and identifiers.

All 14 screenshots were visually reviewed and scanned with Apple Vision OCR for credential signatures, sensitive labels, full UUIDs, long hexadecimal identifiers and IPv4 addresses. The final scan returned no flagged regions. PNG text and EXIF metadata were removed without changing compressed pixel data. The source and built copies are byte-identical. OCR is a supporting check; inspect the full-size image before publishing future replacements.

On macOS, run `swift scripts/check-screenshot-privacy.swift docs/public/screenshots` to repeat the OCR audit. Detailed findings are written to a private temporary report rather than terminal output. Public examples must contain only synthetic content and must exclude account identifiers, credentials and deployment addresses.

The A2UI native capture was replaced with a fresh natural-language request about a short walk. The screenshot shows that ordinary Chinese request and the model-generated two-option card together, with fifteen minutes selected. The user prompt contains no JSON or protocol instructions. The native action was submitted and its visible message verified. The replacement passed the same OCR and metadata checks.
