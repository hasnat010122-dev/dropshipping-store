# FetchWow multiple-image and color update

## Features

- Admin can upload up to 12 images per product.
- Admin can remove images and choose the cover image.
- Admin can enter colors as a comma-separated list, for example `Black, Blue, Red`.
- Product pages show an image gallery and color selector.
- Products with colors cannot be added until a color is selected.
- Different colors of the same product remain separate cart lines.
- The chosen color is included in checkout, orders, tracking, confirmation emails, returns and supplier/admin views.
- Existing products keep their current image automatically.

## Required installation order

1. Open Supabase -> SQL Editor -> New query.
2. Run `PRODUCT-GALLERY-MIGRATION.sql` once.
3. Copy all source files from this package into the identical GitHub paths.
4. Commit to `main` and wait for Vercel to report Ready.
5. Follow `EMAIL-SETUP.md` to activate sign-in emails.

## Test

1. Edit a product in Admin.
2. Upload two or more photos.
3. Enter colors such as `Black, Blue, Red`.
4. Save, approve and publish.
5. Open the product page and test the gallery and each color.
6. Add two different colors to the cart and verify they appear as separate lines.

Validated with ESLint, all 15 automated tests, TypeScript, and a complete Next.js production build.
