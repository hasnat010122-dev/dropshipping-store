# FetchWow Supabase Setup

Never commit or send the database password, connection string, secret key, service-role key, Google secret, Resend key, Admin password or session secret.

## 1. Create the schema and Storage bucket

1. Open the FetchWow Production project in Supabase.
2. Open **SQL Editor**.
3. Select **New query**.
4. Open `supabase/schema.sql` from this repository.
5. Copy its complete contents into the Supabase SQL Editor.
6. Select **Run** once.
7. Confirm the query completes without an error.

The script creates products, orders, users, suppliers, coupons, returns, activities and OTP tables; indexes; Row Level Security; the atomic coupon function; and the public `product-images` bucket with a 5 MB image limit.

## 2. Get server credentials privately

Open **Project Settings → API Keys** (the wording may also appear as **Connect** or **Data API**).

Copy privately:

- Project URL
- Secret key (`sb_secret_...`) for server-side use

If your project only displays legacy keys, use the `service_role` key in `SUPABASE_SERVICE_ROLE_KEY` instead. Never use either secret in a `NEXT_PUBLIC_...` variable.

## 3. Configure the local app

Stop `npm run dev`, then open `.env.local` and add:

```env
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SECRET_KEY=YOUR_PRIVATE_SERVER_SECRET
```

Keep all existing Resend, Google, Admin and session values unchanged. Save and restart:

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run dev
```

## 4. Expected clean start

Supabase starts empty. Existing local JSON test orders and users are intentionally not copied to production. After enabling Supabase:

- The storefront may initially show no products.
- Existing local customer cookies may be cleared because the production user table is new.
- Sign in again with Google or OTP.
- In Admin, add a test product; it must remain Draft until approved and published.
- Upload a product image; its URL should point to Supabase Storage.
- Place a test order; it must appear in the Supabase `orders` table with `approval_status = pending`.
- Supplier forwarding must remain blocked until owner approval.

## 5. Verification in Supabase

Use **Table Editor** to confirm records appear in:

- `products`
- `users`
- `orders`
- `activities`

Use **Storage → product-images** to confirm uploaded product images appear.

After verification, keep the test product/order for final deployment testing or delete them from Admin before launch.
