# FetchWow Dropshipping Store

A Next.js 16 storefront for approval-gated, zero-inventory dropshipping in Pakistan. The project includes customer verification, checkout, accounts, owner administration, product approval, order approval, supplier records, coupons, returns and activity history.

## Safety model

- Browsing is public; checkout requires a verified customer session.
- Every new product starts as **Draft**, must be **Approved**, and only then can be **Published**.
- Every order starts **Pending owner approval**. Supplier email/WhatsApp forwarding and fulfillment progression remain disabled until the owner approves it.
- Prices and item names are recalculated from the server catalog; checkout never trusts browser-submitted prices.
- Supplier cost, supplier URL and sourcing identifiers are removed from public product APIs.
- Admin and customer cookies are signed, HTTP-only JWT sessions.
- No real credential belongs in Git or a `NEXT_PUBLIC_...` variable.

## Local setup

Requirements: Node.js 20.9 or newer.

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

On Windows PowerShell:

```powershell
Copy-Item .env.local.example .env.local
npm run dev
```

Open `http://localhost:3000`.

Before using Admin, set strong values in `.env.local`:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SESSION_SECRET=replace-with-a-long-random-secret
ADMIN_PASSWORD=replace-with-a-strong-owner-password
```

Generate a session secret locally:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Admin is at `http://localhost:3000/admin`. There is no committed or fallback production password.

## Email and Google sign-in

Developer-side support is already implemented. See [`SETUP-INTEGRATIONS.md`](./SETUP-INTEGRATIONS.md) for the owner steps.

Exact local Google callback:

```text
http://localhost:3000/api/auth/google/callback
```

Environment variables:

```env
RESEND_API_KEY=
ORDER_EMAIL_FROM=FetchWow Orders <orders@send.fetchwow.online>
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

When Resend is not configured in local development, the OTP appears on the verification screen. Production never returns the OTP code in an API response.

## Approval workflow

### Products

1. Admin adds a product; it is stored as **Draft** and is absent from the public store.
2. Admin reviews sourcing, price and content, then selects **Approve product**.
3. Admin selects **Publish to store** as a separate action.
4. A published product can be unpublished without deleting its history.

### Orders

1. A verified customer places an order; its status is **Pending owner approval**.
2. Owner reviews customer, product, payment and supplier information.
3. Owner selects **Approve order** or **Reject**.
4. Supplier email, WhatsApp and fulfillment controls become available only after approval.
5. No Markaz order is submitted automatically. Markaz automation remains out of scope until the custom store is complete and you approve that next phase.

## Validation

```bash
npm run lint
npm test
npm run build
```

Or run everything:

```bash
npm run check
```

## Local data warning

Development data is stored in JSON files under `data/`; this folder is excluded from Git. It is suitable for local development but **not for production on Vercel**, because serverless files are not durable shared storage. Before live deployment, migrate products, orders, users, OTP records, coupons, suppliers, returns and activity to a hosted database such as PostgreSQL.

The current upload route writes to `public/uploads/` locally. Production deployment also requires durable object storage for product images.

## Project structure

- `app/` — storefront, account, checkout and Admin pages
- `app/api/` — protected API routes
- `components/` — reusable UI components
- `context/` — cart and display-currency state
- `lib/db.ts` — local development data layer
- `lib/auth.ts` / `lib/session.ts` — signed sessions
- `lib/email.ts` — server-side Resend integration
- `lib/security.ts` — validation, cookie and escaping helpers
- `tests/` — security and integration regression tests
