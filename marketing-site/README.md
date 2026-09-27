# Atlus marketing site

The public site for [joinatlus.com](https://joinatlus.com), built with TanStack Start, React,
TypeScript and Tailwind CSS.

## Local development

Use Node.js 20 or newer.

```sh
npm install
npm run dev
```

The development server prints its local address when it starts. To use a fixed port:

```sh
npm run dev -- --port 8080
```

## Checks

```sh
npm run lint
npm run build
```

## Site structure

- `src/routes` contains the public pages and their page metadata.
- `src/components/atlus` contains the shared Atlus interface and motion components.
- `src/lib/seo.ts` owns canonical URLs, social metadata and structured data.
- `public` contains the sitemap, crawler rules, social preview and brand images.

Set `VITE_ONBOARDING_URL` when the onboarding app is hosted somewhere other than
`https://app.joinatlus.com`.
