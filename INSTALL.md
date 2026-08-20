# FetchWow cumulative update

This package includes every requested change to date, plus the USD and product-image fixes.

## New fixes

- Customer-facing store currency is USD only.
- The PKR/USD toggle is removed.
- Existing PKR product amounts are converted for display using `NEXT_PUBLIC_USD_RATE` (default: 278 PKR per USD).
- Checkout, account history, tracking, product metadata, confirmation pages, and customer emails display USD.
- Because the receiving bank account settles in PKR, checkout and transfer instructions still show the exact PKR amount the customer must send.
- Supabase product images are now authorized in `next.config.ts` for Next.js Image Optimization.

The uploaded image itself was tested and returns HTTP 200. The live Vercel image optimizer returned HTTP 400 because the Supabase hostname was absent from `next.config.ts`; this update adds the exact approved Supabase Storage path.

## Previous included changes

- Bank-account transfer only; no COD or wallets.
- Only account number `00300114982252` is displayed.
- Phone/WhatsApp `03086177169`; email `fetchwow1@gmail.com`.
- Worldwide-delivery wording.
- `Under Rs 1500` option removed.

## Install

Copy every source file in this package into the identical path in the GitHub repository and commit to `main`. Vercel should deploy automatically. A redeployment is required because `next.config.ts` changed.

After Vercel reports Ready:

1. Open the homepage in an incognito window and confirm all product prices show `$` only.
2. Confirm the currency-toggle button is gone.
3. Confirm the uploaded product image appears on the homepage and product page.
4. If the old placeholder remains, hard-refresh with Ctrl+Shift+R or clear the Vercel/browser image cache.
5. Place a test order and confirm the display total is USD while transfer instructions provide the exact PKR settlement amount.

This version passed ESLint, all 15 automated tests, TypeScript validation, and a complete Next.js production build.
