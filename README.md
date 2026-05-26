# Rally — Landing Page

A CRO-optimized landing page for **Rally**, a tennis app that matches players with local hitting partners.

## Design

- **Direction:** Clay-court editorial — sporty-luxe heritage meets find-a-partner utility.
- **3-color system:** clay terracotta (dominant), warm cream (neutral), optic tennis-ball yellow (accent). All other tones are shades of these three hues.
- **Type:** Fraunces (display serif), Hanken Grotesk (body), Space Mono (labels/data).
- **CRO structure:** repeated email capture, sticky nav CTA, stats bar, 3-step clarity, benefit grid, testimonial, FAQ, final CTA.

## Stack

Next.js 14 (App Router) · TypeScript · hand-written CSS · zero runtime UI deps. Scroll reveals use `IntersectionObserver`; the waitlist form is a client component with inline validation and a success state (wire it to your endpoint in `components/WaitlistForm.tsx`).

## Run

```bash
npm install
npm run dev      # http://localhost:3000
```

## Build

```bash
npm run build && npm start
```
