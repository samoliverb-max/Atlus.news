# Atlus website flow

This diagram follows the prepared local code. Paste this file into Codex and ask it to render the Mermaid diagram as an interactive flowchart, with the **local demo**, **prepared production journey**, and **currently live domain** shown separately.

```mermaid
flowchart TD
    Visitor([Visitor opens Atlus]) --> Marketing[Marketing homepage<br/>joinatlus.com or localhost:8080]
    AppRoot[Visitor opens the Next app root<br/>localhost:3000 or its deployed root] --> SameHost{Is marketing on<br/>a different host?}
    SameHost -->|Yes: local or separated domains| Marketing
    SameHost -->|No: current live domain| Auth

    Marketing --> Explore[Explore the public site]
    Explore --> Pages[Manifesto · Team · Why now<br/>How it works · FAQ · Privacy · Research]
    Pages --> Marketing

    Marketing -->|Start / Start onboarding| Anchor[Join Atlus section on the homepage]
    Anchor --> Mode{How is the marketing site running?}

    Mode -->|Local development, no VITE_ONBOARDING_URL| DemoLink[Join Atlus link]
    DemoLink --> DemoOnboarding[Next app /onboarding<br/>localhost:3000]
    DemoOnboarding -->|submit in demo mode| DemoToday[Today sample edition]
    DemoToday --> DemoAreas[Archive · Your profile · Settings · Feedback]
    DemoAreas --> DemoToday

    Mode -->|Deployed build| SignupLink[Join Atlus link]
    SignupLink --> Signup[Newer Next app<br/>/login?mode=signup]
    Signup --> RealOnboarding

    DirectProduct[Direct visit to a Next app route<br/>/login, /today, /profile, etc.] --> Auth{Demo mode or signed in?}
    Auth -->|Demo mode| DemoToday
    Auth -->|Signed in, setup complete| RealToday[Today edition from Supabase]
    Auth -->|New account or incomplete setup| RealOnboarding[Next app onboarding]
    Auth -->|Signed out| Login[Login / create account]
    Login --> RealOnboarding
    RealOnboarding --> RealToday
    RealToday --> ProductAreas[Archive · Your profile · Settings · Feedback]
    ProductAreas --> RealToday

    classDef marketing fill:#e8f0eb,stroke:#4a705d,color:#173d2c;
    classDef demo fill:#e8eff8,stroke:#5275a0,color:#172f4c;
    classDef legacy fill:#f7eadf,stroke:#af7650,color:#51311d;
    class Marketing,Explore,Pages,Anchor,Mode marketing;
    class DemoLink,DemoOnboarding,DemoToday,DemoAreas demo;
    class SignupLink,Signup legacy;
```

## What this means

- **The local first page is the marketing homepage.** Open `http://localhost:8080`. The Next app's bare root (`http://localhost:3000/`) now redirects there. A deployed Next app redirects to `https://joinatlus.com` (or `ATLUS_MARKETING_URL`) only when marketing is hosted on a different host.
- **The live public domain is not marketing yet.** On 20 October 2026, opening `https://joinatlus.com/` reached the Next app's `/login` screen. `app.joinatlus.com` did not resolve in the browser. The root redirect intentionally avoids sending the live domain back to itself. Making marketing the live first page requires deploying it at `joinatlus.com` and putting the product app on a separate host. The domain uses `dns1.p05.nsone.net` through `dns4.p05.nsone.net` name servers, consistent with Netlify-managed DNS; the Netlify account is not connected in this workspace.
- **The local Join button opens the newer Next app.** With the default development configuration it links to `http://localhost:3000/onboarding`. Demo submission leads to a sample Today edition. Demo changes are not saved.
- **The prepared deployed Join link uses the newer product.** It opens `https://app.joinatlus.com/login?mode=signup` by default (or the `VITE_APP_URL` host). Account creation then leads into Next app onboarding and its Supabase-backed Today edition. The former email handoff to the Express prototype has been removed from the prepared marketing code. This path cannot work live until the product app is available on its own host.
- **The Next app has its own account journey.** A direct visit to its `/login` or `/today` routes follows Supabase authentication and the newer onboarding flow when demo mode is off. The marketing site's deployed form is not currently wired to that journey.

## Source files

- Marketing entry, Join link and production email handoff: `marketing-site/src/routes/index.tsx`
- Public navigation: `marketing-site/src/components/atlus/SiteChrome.tsx`
- Next app root redirect: `atlus-mvp/app/page.tsx`
- Next app account routing: `atlus-mvp/app/login/actions.ts`, `atlus-mvp/lib/auth.ts`, `atlus-mvp/components/NavLinks.tsx`
- Older onboarding API and UI: `backend/src/app.ts`, `frontend/onboarding-prototype.html`
