// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { hoconGrammar } from './src/lib/hocon-grammar.mjs';

// GitHub Pages serves this project site under /hocon/. `site` + `base` together
// are what make canonical URLs, the sitemap and Starlight's internal links
// resolve correctly — changing one without the other silently breaks the other.
const SITE = 'https://o3co.github.io';
const BASE = '/hocon';

export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: 'always',
  integrations: [
    starlight({
      title: 'HOCON',
      description:
        'One HOCON specification, four spec-compliant parsers — TypeScript, Go, Rust and Python — plus a conversion CLI and a shared conformance corpus.',
      logo: { src: './src/assets/logo.svg', replacesTitle: false },
      favicon: '/favicon.svg',
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/o3co',
        },
      ],
      editLink: {
        baseUrl: 'https://github.com/o3co/hocon/edit/main/',
      },
      lastUpdated: true,
      customCss: ['./src/styles/custom.css'],
      expressiveCode: {
        // Shiki has no HOCON grammar, so without this every ```hocon block on
        // a site about HOCON renders as plain text.
        shiki: { langs: [hoconGrammar] },
      },
      components: {
        // Both overrides render the stock component and append to it: the tag
        // in <head>, the consent bar at the end of the page. Everything else
        // stays stock Starlight.
        Head: './src/components/Head.astro',
        Footer: './src/components/Footer.astro',
      },
      sidebar: [
        {
          label: 'Start here',
          items: [
            { label: 'What is HOCON?', slug: 'start/what-is-hocon' },
            { label: 'Quick start', slug: 'start/quickstart' },
          ],
        },
        {
          label: 'Implementations',
          items: [
            { label: 'Choosing one', slug: 'implementations' },
            { label: 'Format adapters', slug: 'implementations/adapters' },
          ],
        },
        {
          label: 'Specification',
          items: [{ label: 'Compliance', slug: 'spec/compliance' }],
        },
        {
          label: 'Tools',
          items: [{ label: 'hocon2 CLI', slug: 'tools/hocon2' }],
        },
      ],
      pagination: true,
    }),
  ],
});
