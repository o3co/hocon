# hocon — Agent Guidelines

The documentation hub for the o3co HOCON family, published to
<https://o3co.github.io/hocon/>. Astro + Starlight, deployed to GitHub Pages.

## Commands

```sh
pnpm install
pnpm dev                        # http://localhost:4321/hocon/
pnpm build                      # -> dist/
pnpm check                      # astro check — must be clean before a PR
HOCON_SITE_OFFLINE=1 pnpm build # build without network
```

## The one rule that matters here

**Do not write a fact into this repository that lives in another one.**

Minimum language versions, compliance percentages, release versions and feature-support claims
belong to the six sibling repositories. This site links to them, or derives them at build time
in [`src/data/implementations.ts`](src/data/implementations.ts). It never transcribes them.

This is not a style preference. In July 2026 an external review found the published READMEs
claiming `Requires Go 1.21+` against a `go.mod` that said 1.23, and compliance rates two months
and fifteen points behind the matrix. Nothing had broken — the numbers had been copied once and
never revisited, and readers trusted the stale copy over the source. A public site makes that
failure larger, not smaller.

When you want to put a number on a page:

1. **Link to the source instead.** This is almost always the right answer.
2. **Derive it at build time** if it genuinely belongs inline. Add a parser to
   `src/data/implementations.ts`, reading the manifest or document that owns the fact.
3. **Do not print a version number at all.** Registry badges already do this and stay current
   for free.

A failed fetch fails the build on purpose — shipping the previous value silently is the exact
failure being designed out. `HOCON_SITE_OFFLINE=1` renders those values as `—` for offline work.

The scheduled rebuild in [`deploy.yml`](.github/workflows/deploy.yml) exists for the same
reason: a release in any sibling repository changes what this site should say, and none of them
notifies this one.

## Content

Pages live in `src/content/docs/`, sidebar order in `astro.config.mjs`.

Prose describes what is true across all four implementations. Anything specific to one belongs
in that repository's own README or API documentation, linked from here. A per-language API
reference on this site would go stale in four directions at once.

Language-specific snippets go in Starlight `<Tabs syncKey="implementation">` so the reader's
choice follows them across pages — and so the tab change registers as a signal.

HOCON code blocks use the ```` ```hocon ```` fence. The grammar is local to this repo
([`src/lib/hocon-grammar.mjs`](src/lib/hocon-grammar.mjs)) because Shiki does not ship one.

## Analytics

GA4, in [`src/components/Analytics.astro`](src/components/Analytics.astro).

- The measurement ID comes from `PUBLIC_GA_MEASUREMENT_ID` (CI: repository variable
  `GA_MEASUREMENT_ID`). **Never hardcode it** — an unset ID must emit no analytics code, so a
  fork does not report into someone else's property.
- Use a property of this site's own. Mixing documentation traffic into the corporate site's
  property makes both harder to read.
- Consent Mode v2 starts denied. Do not change that default without also changing what the
  consent bar claims.
- To track a new control, add `data-analytics-event` and `data-analytics-param-*` attributes to
  the markup. Do not add per-component analytics code.

Treat the implementation split as a lower bound with a lean. This audience blocks analytics
heavily and unevenly across language communities, so the numbers rank interest, they do not
measure it. Adoption is a registry-download question, and that data is not here.

## PR workflow

`multi-agent-review` → PR → `github-pr-review`. Resolve every review thread before merge.
