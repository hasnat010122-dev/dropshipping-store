# Zelko

A complete online store: storefront, verification-gated checkout, customer
accounts, and a full admin dashboard for managing products, orders,
suppliers, discounts, and returns.

**Note:** the brand name lives in one place — `lib/brand.ts`. Change it there
and it updates everywhere (header, footer, favicon, emails, page titles).

## Running it locally

```
npm install
npm run dev
```

Open http://localhost:3000 for the store.

## How checkout works

1. Customer browses and adds items to their cart — no sign-in needed for this.
2. Clicking **"Proceed to checkout"** checks if they're signed in.
3. If not, they're sent to verify — either **"Continue with Google"** or
   **email + a 6-digit code** (no password).
4. Once verified, they land on the checkout page: delivery address (with
   saved-address quick-select if they have one), payment method, and order
   summary — styled like a standard e-commerce checkout.
5. This is enforced both in the UI and at the server/middleware level, so it
   can't be bypassed by visiting `/checkout` directly.

Guest *browsing* is fully open — only placing an order requires verification.

## The admin panel

Go to **http://localhost:3000/admin** — default password `buyzo123` (change
this via `.env.local` before deploying).

- **Dashboard** — revenue chart, orders, low stock, pending returns, recent activity
- **Products** — add/edit/delete, link to a supplier, upload photos
- **Orders** — status tracking + supplier fulfillment tracking (tracking numbers, links)
- **Discounts** — create coupon codes (percentage or fixed amount off)
- **Returns** — customer-submitted return/exchange requests
- **Suppliers** — your sourcing contacts and platforms
- **Activity Log** — everything that's happened on the store

## Customer accounts

`/account` — order history and saved addresses. Sign-in is via Google OAuth
or email OTP (see `.env.local.example` for setup — Google needs your own
OAuth credentials; email OTP works out of the box in dev mode, showing the
code directly on screen until you configure real email sending).

## How data is stored

Everything (products, orders, users, coupons, suppliers, returns, activity)
lives in JSON files under `data/` — no database server needed. This folder
is excluded from git. Back it up periodically once you have real data in it.

## Payments

Checkout collects the customer's chosen method (JazzCash/Easypaisa/SadaPay/
NayaPay/Cash on Delivery) but doesn't charge them yet — that requires signing
up as a merchant with each provider and wiring in their API. Ask when you're
ready to add real payment processing.

## Deploying it live

This is a Next.js app — deploys cleanly to Vercel. Before deploying:
1. Set `ADMIN_PASSWORD` and `SESSION_SECRET` to real random values
2. Set `NEXT_PUBLIC_SITE_URL` to your real domain
3. Move from local JSON storage to a hosted database (e.g. Neon/Supabase) —
   local files don't persist on serverless hosts
4. If using Google sign-in, add the production redirect URI in Google Cloud Console

## Project structure

- `app/` — every page (storefront, checkout, account, admin)
- `app/api/` — backend routes
- `lib/db.ts` — the data layer
- `lib/brand.ts` — brand name/tagline — the one place to rename the store
- `lib/session.ts` — customer login sessions
- `lib/auth.ts` — admin login
- `context/` — cart and currency state
- `components/` — reusable UI pieces
