# hocon — documentation hub

The site at **<https://o3co.github.io/hocon/>**: one entry point for the o3co HOCON
implementations and the tooling around them.

| | |
| --- | --- |
| [ts.hocon](https://github.com/o3co/ts.hocon) | HOCON parser for TypeScript |
| [go.hocon](https://github.com/o3co/go.hocon) | HOCON parser for Go |
| [rs.hocon](https://github.com/o3co/rs.hocon) | HOCON parser for Rust |
| [py.hocon](https://github.com/o3co/py.hocon) | HOCON parser for Python |
| [hocon2](https://github.com/o3co/hocon2) | HOCON ⇄ JSON / YAML / TOML / Properties CLI |
| [xx.hocon](https://github.com/o3co/xx.hocon) | Shared conformance corpus and specification checklist |

Built with [Astro](https://astro.build) and [Starlight](https://starlight.astro.build),
deployed to GitHub Pages by [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

## Develop

```sh
pnpm install
pnpm dev       # http://localhost:4321/hocon/
pnpm build     # -> dist/
pnpm preview
pnpm check     # astro check (types + content collections)
```

Node 22 or newer, pnpm 11.

## Facts are derived, not written down

The minimum language version shown for each implementation, and the compliance percentages on
the specification page, are **fetched from the source repositories during the build** — from
`package.json`, `go.mod`, `Cargo.toml`, `pyproject.toml`, and xx.hocon's
`docs/compliance-matrix.md`. None of them is transcribed into this repository.

That is a reaction to a specific failure. In July 2026 an external review found the published
READMEs claiming `Requires Go 1.21+` against a `go.mod` that said 1.23, and compliance rates
that had drifted more than fifteen points behind the matrix over two months. Nothing was
broken; the numbers had simply been copied once and never revisited. A public site repeats that
mistake in front of a larger audience.

Two consequences follow, both intentional:

- **A failed fetch fails the build.** Falling back to the last known value would silently ship
  the stale number, which is the failure being designed out. For offline work,
  `HOCON_SITE_OFFLINE=1 pnpm build` renders those values as `—`.
- **The workflow rebuilds on a schedule.** A push here is not the only thing that can change
  these numbers — a release in any of the six sibling repositories can, and none of them
  notifies this one.

When adding content, prefer linking to the source over restating it. If a number genuinely
belongs on the page, derive it in [`src/data/implementations.ts`](src/data/implementations.ts).

## Analytics

Google Analytics 4, configured in
[`src/components/Analytics.astro`](src/components/Analytics.astro):

- **The measurement ID lives in the environment.** `PUBLIC_GA_MEASUREMENT_ID`, supplied in CI
  from the repository variable `GA_MEASUREMENT_ID`. Unset means no analytics code is emitted at
  all, which is what a fork or a local build should do. See [`.env.example`](.env.example).
- **Consent Mode v2 starts denied.** No cookie is written until a visitor opts in; until then
  GA4 receives cookieless pings, which is enough to count pages. The consent bar asks for the
  rest and can be removed with `PUBLIC_ANALYTICS_CONSENT_BANNER=false`.
- **Events are declared in markup.** Any element with `data-analytics-event` reports that event
  on click, passing every `data-analytics-param-*` attribute through as a parameter. Outbound
  links are tracked automatically. Adding a tracked control is a markup change, not a wiring
  change.

Events currently collected: `copy_install_command` and `select_implementation` (both carry
which implementation), plus `outbound_click` (destination and, where known, implementation).

**Read the implementation split as a lower bound with a lean, not as a measurement.** This
audience blocks analytics at a high rate, and not uniformly across language communities.
Registry download counts (npm, crates.io, PyPI, pkg.go.dev) are the honest adoption signal;
this site measures interest at the front door.

## Licence

Apache-2.0. See [LICENSE](LICENSE).
