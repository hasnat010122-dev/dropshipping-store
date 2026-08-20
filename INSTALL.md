# Professional address and USD admin pricing update

## Changes

### Checkout and saved addresses

- Country / Region
- Street address
- Apartment, suite or unit (optional)
- City
- State / Province / Region
- Postal / ZIP code
- Phone number
- Browser autofill attributes for professional address completion
- Existing old saved addresses remain compatible
- Complete structured address is included with the order

### Admin product pricing

- Selling price input is USD
- Original/compare-at price input is USD
- Supplier cost input is USD
- Product cards in Admin display USD
- Existing stored PKR values are converted to USD when editing
- USD input is converted back to PKR internally so the current checkout and Pakistani bank-transfer settlement continue to work correctly
- Uses `NEXT_PUBLIC_USD_RATE`, defaulting to 278 PKR per USD

This package also includes the improved product-save error handling in the Admin Products file.

## Install

Copy all six source files to the identical paths in GitHub, commit to `main`, and wait for Vercel to deploy. No Supabase migration is required for the address update because saved addresses are stored as JSON.

Validated with ESLint, all 15 tests, TypeScript, and a complete production build.
