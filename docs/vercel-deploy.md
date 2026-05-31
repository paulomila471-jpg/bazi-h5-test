# Vercel Deployment Guide

This project is the H5 test version of the Bazi app. It does not include Qimen, matching, or real in-site payment.

## 1. Prepare GitHub

Upload the project source to GitHub, including:

- `app/`
- `components/`
- `lib/`
- `public/`
- `supabase/`
- `docs/`
- `tests/`
- `.env.example`
- `next.config.ts`
- `package.json`
- `package-lock.json`
- `postcss.config.js`
- `tailwind.config.ts`
- `tsconfig.json`
- `next-env.d.ts`

Do not upload:

- `node_modules/`
- `.next/`
- `.env.local`
- real API keys or service-role keys
- local log files such as `next-dev-3001.log`

## 2. Import Into Vercel

1. Open Vercel Dashboard.
2. Click `Add New...` -> `Project`.
3. Import the GitHub repository.
4. Framework preset: `Next.js`.
5. Build command: `npm.cmd run build` locally, `npm run build` on Vercel.
6. Output directory: leave default.
7. Install command: `npm install`.

## 3. Environment Variables

Set these in Vercel Project Settings -> Environment Variables:

```env
NEXT_PUBLIC_CONTACT_WECHAT=guotingyuan258
CONTACT_WECHAT=guotingyuan258
NEXT_PUBLIC_PAYMENT_ENABLED=false
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
ADMIN_PASSWORD=
NEXT_PUBLIC_ICP_BEIAN=
NEXT_PUBLIC_ICP_LICENSE=
NEXT_PUBLIC_POLICE_BEIAN=
```

Only `NEXT_PUBLIC_*` variables are exposed to the browser. Never place private API keys, Supabase `service_role` keys, OpenAI keys, DeepSeek keys, or `ADMIN_PASSWORD` in frontend variables.

## 4. Bind Domain

1. In Vercel Project Settings, open `Domains`.
2. Add your domain, for example `example.com` or `www.example.com`.
3. Follow Vercel DNS instructions:
   - Apex domain usually uses an `A` record.
   - `www` usually uses a `CNAME` record to Vercel.
4. Wait for DNS verification and SSL issuance.
5. Update ICP/footer environment variables after the ICP filing information is available.

## 5. Production Build

Local check:

```bash
npm.cmd install
npm.cmd run build
npm.cmd run start -- -p 3001
```

Vercel will run:

```bash
npm install
npm run build
```

## 6. Notes

- The H5 user flow only shows the free preview.
- Manual unlock orders are currently stored in browser `localStorage` for test use.
- The admin pages are test-only and should be protected with administrator login before public production use.
- Real payment is intentionally disabled.
