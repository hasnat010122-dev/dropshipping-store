# Separate color buttons with color-specific images

## What changes

- Admin adds each color separately instead of typing one comma-separated value.
- Every color is shown as its own row and its own storefront button.
- Admin can assign any uploaded product photo to each color.
- Clicking a color on the product page switches to that color's assigned image.
- If no image is assigned to a color, clicking it shows the normal cover image.
- Removing a color also removes its image assignment.

## Install order

1. In Supabase SQL Editor, run `RUN-IN-SUPABASE.sql` without copying any brackets or Markdown backticks.
2. Confirm the result shows `color_images | jsonb`.
3. Copy the seven source files to the identical GitHub paths.
4. Commit to `main` and wait for Vercel to report Ready.
5. Edit a product, upload all color photos first, add colors one at a time, and select the matching photo for each color.

Validated with ESLint, all 15 tests, TypeScript, and a full production build.
