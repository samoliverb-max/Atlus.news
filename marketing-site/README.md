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

Set `VITE_APP_URL` when the newer product app is hosted somewhere other than
`https://app.joinatlus.com`. The public Join link opens account creation there;
the local link opens demo onboarding at `http://localhost:3000/onboarding`.

## Netlify deployment

Create a separate Netlify site from this repository with `marketing-site` as
its base directory. The included `netlify.toml` builds the TanStack Start app
and publishes `dist/client`; the Netlify Vite plugin supplies its server function.

Before assigning `joinatlus.com` to this site, move the product app to
`app.joinatlus.com`, set its `NEXT_PUBLIC_APP_URL` to that address, and allow
`https://app.joinatlus.com/auth/callback` in Supabase Auth. Then test account
creation and onboarding on the app subdomain before switching the public domain.
