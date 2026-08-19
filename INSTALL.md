# FetchWow bank-payment update

This update keeps only these checkout methods:

1. Cash on Delivery
2. Meezan Bank transfer

It removes JazzCash, Easypaisa, SadaPay and NayaPay from checkout and store messaging. For a bank-transfer order, the checkout and confirmation page show the receiving account. The customer is instructed to transfer the exact order total, use the short order ID as the payment reference, and keep the receipt. The order remains pending for manual confirmation.

## Changed files

Copy these files into the same paths in the GitHub repository:

- `app/page.tsx`
- `app/checkout/page.tsx`
- `app/api/orders/route.ts`
- `app/order-confirmation/[id]/page.tsx`
- `components/Footer.tsx`
- `components/ProductHero.tsx`
- `lib/email.ts`
- `lib/payment.ts` (new)

Commit the files to the `main` branch. Vercel should deploy the GitHub commit automatically.

## Verification

After Vercel reports Ready:

1. Add a product to the cart.
2. Open checkout.
3. Confirm only Cash on Delivery and Meezan Bank transfer appear.
4. Select bank transfer and confirm the account details appear.
5. Place a small test order and verify the order-confirmation page shows the exact total and short order ID.
6. Confirm the order appears as pending in Admin before manually approving it.

The project passed ESLint, all 15 automated tests, TypeScript checking, and a full Next.js production build before packaging.
