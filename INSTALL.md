# FetchWow worldwide single-account update

This cumulative update includes all requested changes:

- Removes Cash on Delivery and all wallet options.
- Keeps only manual bank-account transfer.
- Displays only account number `00300114982252` (no bank name, title, or IBAN).
- Adds Phone / WhatsApp `03086177169` and email `fetchwow1@gmail.com`.
- Replaces Pakistan-only delivery wording with worldwide-delivery wording throughout the customer-facing store.
- Removes the `Under Rs 1500` navigation option, collection handling, and sitemap entry.

## Install

Copy every source file in this package into the same path in the GitHub repository. Commit the files to the `main` branch. Vercel should deploy the commit automatically.

After Vercel reports Ready, verify the homepage, navigation, product page, Shipping page, Contact page, checkout, and one test order.

This version passed ESLint, all 15 tests, TypeScript validation, and a full Next.js production build.
