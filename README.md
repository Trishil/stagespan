# Textflow — independent brochure website

Public client-facing site: https://trishil.github.io/textflow/

Workspace: https://trishil.github.io/textflow-workspace/?experience=workspace

This is an independent, buildless HTML/CSS/JavaScript site. It does not import the factory ERP, React, Firebase, spreadsheet tools, authentication code or application data. The muted film starts after page loading, with a crossfade from its poster. Reduced-motion and data-saving preferences keep the still image; autoplay rejection leaves the play control available. Website content remains readable without JavaScript. Fonts and responsive images are self-hosted.

## Local preview

Run `python3 -m http.server 3013 --bind 127.0.0.1` in this directory, then open http://127.0.0.1:3013/.

## Checks

Run `python3 scripts/check_site.py` and `node --check site.js`. The checks enforce a 15 KB JavaScript budget, no blocking initial video element, valid local assets, fonts and anchors.

## Publishing

GitHub Pages serves the main branch at the repository root. `.nojekyll` disables Jekyll processing. No npm install or build is necessary.

The brochure links to the separately deployed workspace for sign-in and registration. No accounts or private data are processed by this repository.

## Assets

The imagery illustrates the manufacturing story; it is not live factory telemetry. Original supplied assets and AI-generated editorial imagery were optimized for this page. Font licenses are included in `fonts/`.

## Sales experience

Workshop, Factory and Multi-site plans use Request a quote; no prices are promised. Quote buttons preselect the inquiry topic. The sample job panel is illustrative and never changes real factory records. The longer textile story is optional.

Inquiries go to `trishilbalar92@gmail.com`. The form validates and prepares a reviewable email draft, then the visitor can open their email app or copy the inquiry. This static website does not send, store or automatically deliver inquiries. The direct email link remains available without JavaScript.

Run `node --test scripts/inquiry.test.mjs` to check draft generation, recipient, encoding and validation.
