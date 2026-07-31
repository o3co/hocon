/**
 * Facts about the sibling implementations.
 *
 * The split here is deliberate and is the rule this repo is built around:
 *
 *   - Things that do not rot (repo URL, package name, install command shape)
 *     live in this file as constants.
 *   - Things that DO rot (minimum language version, spec compliance rate) are
 *     fetched from the source repositories **at build time**. They are never
 *     transcribed here.
 *
 * The reason is a real incident: in July 2026 an external review found the
 * published READMEs claiming "Requires Go 1.21+" against a go.mod that said
 * 1.23, and compliance rates two months stale by more than 15 points. A
 * public site repeats that mistake with a wider audience, so the numbers on
 * this site are derived, and a scheduled rebuild keeps them fresh.
 *
 * If a fetch fails the build fails. That is intended: shipping the previous
 * (stale) number silently is the exact failure mode being designed out. For
 * offline local work set HOCON_SITE_OFFLINE=1, which renders the affected
 * values as "—" instead.
 */

const RAW = 'https://raw.githubusercontent.com';

const OFFLINE = process.env.HOCON_SITE_OFFLINE === '1';

export type ImplId = 'typescript' | 'go' | 'rust' | 'python';

export interface Implementation {
  id: ImplId;
  /** Display name of the language. */
  language: string;
  /** Repository name, also the compliance-matrix row label. */
  repo: string;
  /** Default branch — not uniform across the family, so it is explicit. */
  branch: string;
  /** Package name as published to the language's registry. */
  packageName: string;
  /** Registry the package is published to. */
  registry: { name: string; url: string };
  /** The command a user runs to add it to a project. */
  install: string;
  /** Language of the install snippet, for syntax highlighting. */
  installLang: string;
  /** Where generated API documentation lives, if published. */
  apiDocs?: { label: string; url: string };
  /** One line on what makes this port distinctive. */
  note: string;
  /** Manifest to read the minimum language version out of. */
  manifest: { path: string; kind: 'package.json' | 'go.mod' | 'Cargo.toml' | 'pyproject.toml' };
}

export const IMPLEMENTATIONS: readonly Implementation[] = [
  {
    id: 'typescript',
    language: 'TypeScript',
    repo: 'ts.hocon',
    branch: 'develop',
    packageName: '@o3co/ts.hocon',
    registry: { name: 'npm', url: 'https://www.npmjs.com/package/@o3co/ts.hocon' },
    install: 'npm install @o3co/ts.hocon',
    installLang: 'sh',
    apiDocs: { label: 'TypeDoc', url: 'https://o3co.github.io/ts.hocon/' },
    note: 'Runs in Node and the browser. Ships an optional Zod bridge for typed config.',
    manifest: { path: 'package.json', kind: 'package.json' },
  },
  {
    id: 'go',
    language: 'Go',
    repo: 'go.hocon',
    branch: 'develop',
    packageName: 'github.com/o3co/go.hocon',
    registry: { name: 'pkg.go.dev', url: 'https://pkg.go.dev/github.com/o3co/go.hocon' },
    install: 'go get github.com/o3co/go.hocon',
    installLang: 'sh',
    apiDocs: { label: 'pkg.go.dev', url: 'https://pkg.go.dev/github.com/o3co/go.hocon' },
    note: 'Zero external dependencies in the core; adapters live in a nested module.',
    manifest: { path: 'go.mod', kind: 'go.mod' },
  },
  {
    id: 'rust',
    language: 'Rust',
    repo: 'rs.hocon',
    branch: 'develop',
    packageName: 'hocon-parser',
    registry: { name: 'crates.io', url: 'https://crates.io/crates/hocon-parser' },
    install: 'cargo add hocon-parser',
    installLang: 'sh',
    apiDocs: { label: 'docs.rs', url: 'https://docs.rs/hocon-parser' },
    note: 'One dependency (indexmap). Serde and every adapter are feature-gated.',
    manifest: { path: 'Cargo.toml', kind: 'Cargo.toml' },
  },
  {
    id: 'python',
    language: 'Python',
    repo: 'py.hocon',
    branch: 'main',
    packageName: 'hocon-parser',
    registry: { name: 'PyPI', url: 'https://pypi.org/project/hocon-parser/' },
    install: 'pip install hocon-parser',
    installLang: 'sh',
    note: 'Pure standard library. Imported as `hocon`, published as `hocon-parser`.',
    manifest: { path: 'pyproject.toml', kind: 'pyproject.toml' },
  },
];

export const SPEC_REPO = { repo: 'xx.hocon', branch: 'main' };

async function fetchRaw(repo: string, branch: string, path: string): Promise<string> {
  const url = `${RAW}/o3co/${repo}/${branch}/${path}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(
      `Could not read ${url} (HTTP ${res.status}). This site derives version and ` +
        `compliance facts from the source repositories at build time rather than ` +
        `hardcoding them; a failed fetch fails the build on purpose. Set ` +
        `HOCON_SITE_OFFLINE=1 to build without them.`
    );
  }
  return res.text();
}

/** Extract "the minimum language version this implementation supports". */
function parseMinimumVersion(kind: Implementation['manifest']['kind'], source: string): string {
  switch (kind) {
    case 'package.json': {
      const node = JSON.parse(source)?.engines?.node;
      const m = typeof node === 'string' ? node.match(/(\d+(?:\.\d+)*)/) : null;
      if (!m) throw new Error('package.json has no engines.node range');
      return `Node.js ${m[1]}+`;
    }
    case 'go.mod': {
      const m = source.match(/^go\s+(\d+\.\d+(?:\.\d+)?)/m);
      if (!m) throw new Error('go.mod has no go directive');
      // go.mod carries a patch component (1.23.0); the user-facing floor is the
      // minor release.
      const [major, minor] = m[1]!.split('.');
      return `Go ${major}.${minor}+`;
    }
    case 'Cargo.toml': {
      const m = source.match(/^rust-version\s*=\s*"([^"]+)"/m);
      if (!m) throw new Error('Cargo.toml has no rust-version');
      return `Rust ${m[1]}+`;
    }
    case 'pyproject.toml': {
      const m = source.match(/^requires-python\s*=\s*"[^0-9]*(\d+\.\d+)/m);
      if (!m) throw new Error('pyproject.toml has no requires-python');
      return `Python ${m[1]}+`;
    }
  }
}

export interface ImplementationFacts extends Implementation {
  /** Minimum language version, read from the manifest at build time. */
  minimumVersion: string;
}

export async function getImplementationFacts(): Promise<ImplementationFacts[]> {
  return Promise.all(
    IMPLEMENTATIONS.map(async (impl) => {
      if (OFFLINE) return { ...impl, minimumVersion: '—' };
      const source = await fetchRaw(impl.repo, impl.branch, impl.manifest.path);
      try {
        return { ...impl, minimumVersion: parseMinimumVersion(impl.manifest.kind, source) };
      } catch (cause) {
        throw new Error(
          `Could not read the minimum language version out of ${impl.repo}/${impl.manifest.path}: ` +
            `${(cause as Error).message}. The manifest format changed — update ` +
            `parseMinimumVersion() rather than transcribing the version by hand.`
        );
      }
    })
  );
}

export interface ComplianceRow {
  repo: string;
  detailUrl: string;
  /** (✅ + ⚠️·0.5) / 210 — every spec item, including the out-of-scope ones. */
  specTotal: string;
  /** Same numerator over a per-implementation denominator that drops ➖ items. */
  inScope: string;
  pass: number;
  partial: number;
  fail: number;
  unverified: number;
  outOfScope: number;
}

/**
 * Parse the top-line table out of xx.hocon's compliance-matrix.md.
 *
 * That table is the cross-implementation source of truth, and it is the exact
 * table that went stale when it was copied into four READMEs.
 */
export async function getComplianceTable(): Promise<ComplianceRow[]> {
  if (OFFLINE) return [];
  const md = await fetchRaw(SPEC_REPO.repo, SPEC_REPO.branch, 'docs/compliance-matrix.md');

  const rowPattern =
    /^\|\s*\[([^\]]+)\]\(([^)]+)\)\s*\|\s*\*\*([\d.]+%)\*\*\s*\|\s*\*\*([\d.]+%)\*\*\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|/gm;

  const rows: ComplianceRow[] = [];
  for (const m of md.matchAll(rowPattern)) {
    rows.push({
      repo: m[1]!,
      detailUrl: m[2]!,
      specTotal: m[3]!,
      inScope: m[4]!,
      pass: Number(m[5]),
      partial: Number(m[6]),
      fail: Number(m[7]),
      unverified: Number(m[8]),
      outOfScope: Number(m[9]),
    });
  }

  if (rows.length !== IMPLEMENTATIONS.length) {
    throw new Error(
      `Expected ${IMPLEMENTATIONS.length} rows in xx.hocon's compliance matrix, parsed ${rows.length}. ` +
        `The table layout changed — fix getComplianceTable() rather than pasting the numbers in.`
    );
  }
  return rows;
}

export const COMPLIANCE_MATRIX_URL =
  'https://github.com/o3co/xx.hocon/blob/main/docs/compliance-matrix.md';
export const SPEC_CHECKLIST_URL =
  'https://github.com/o3co/xx.hocon/blob/main/docs/spec-checklist.md';
export const HOCON_SPEC_URL = 'https://github.com/lightbend/config/blob/main/HOCON.md';
