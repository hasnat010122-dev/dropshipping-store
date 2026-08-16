# Resend + Google OAuth Setup

Never paste API keys, OAuth secrets, passwords or session secrets into chat, GitHub issues, screenshots or committed files. Enter them only in your local `.env.local` and later in the hosting provider's encrypted environment settings.

## Part A — Order and OTP email with Resend

Official documentation: https://resend.com/docs

### A1. Choose the sending subdomain

Use a dedicated subdomain such as:

```text
send.fetchwow.online
```

A subdomain separates transactional-email reputation from the root website domain. Your sender can then be:

```text
FetchWow Orders <orders@send.fetchwow.online>
```

### A2. Add and verify the domain

1. Create/sign in to the Resend account at https://resend.com.
2. Open **Domains** and select **Add Domain**.
3. Enter the sending subdomain.
4. Resend will display DNS records, normally including SPF/MX and DKIM records.
5. Open the DNS manager where the domain's nameservers are managed.
6. Copy each record exactly. When the DNS provider automatically appends the root domain, enter only the host/name portion shown by its interface.
7. Return to Resend and select **Verify DNS Records**.
8. Wait until the domain status is **Verified**.

Do not guess DNS values; use the exact records displayed in your own Resend dashboard.

### A3. Create a restricted API key

1. In Resend, open **API Keys**.
2. Create a key for this store only.
3. Restrict it to sending access and the verified domain when those controls are available.
4. Copy it once and place it in `.env.local`—never commit it.

```env
RESEND_API_KEY=replace-locally
ORDER_EMAIL_FROM=FetchWow Orders <orders@send.fetchwow.online>
```

Restart `npm run dev` after changing `.env.local`.

### A4. Local email test

1. Open `http://localhost:3000/account/login`.
2. Enter an email you control.
3. Confirm the OTP arrives and expires after 10 minutes.
4. Verify the code and place a test order.
5. Confirm the order-received email arrives.
6. Confirm the order is still pending owner approval and is not forwarded to a supplier.

## Part B — Google sign-in

Official documentation: https://developers.google.com/identity/protocols/oauth2/web-server

### B1. Create the Google project

1. Open https://console.cloud.google.com/.
2. Create or select a project for the store.
3. Open **Google Auth Platform**.
4. Configure Branding, Audience and Data Access.
5. For development, use **External** audience and add your own Google account as a test user if the app remains in testing mode.
6. Only `openid`, `email`, and `profile` are requested by this store.

### B2. Create OAuth credentials

1. Open **Clients** and create a client.
2. Select **Web application**.
3. Add this Authorized JavaScript origin:

```text
http://localhost:3000
```

4. Add this exact Authorized redirect URI:

```text
http://localhost:3000/api/auth/google/callback
```

The scheme, hostname, port and path must match exactly.

### B3. Configure local credentials

Put the generated values into `.env.local`:

```env
GOOGLE_CLIENT_ID=replace-locally.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=replace-locally
```

Restart `npm run dev`, open `/account/login`, and test **Continue with Google**.

### B4. Add production URLs later

After the final domain is connected, update:

```env
NEXT_PUBLIC_SITE_URL=https://fetchwow.online
```

Add to the same Google Web client:

```text
Authorized JavaScript origin:
https://fetchwow.online

Authorized redirect URI:
https://fetchwow.online/api/auth/google/callback
```

Keep localhost entries for local development if desired.

## Part C — Pre-production requirements

Before the store is genuinely live:

- Replace JSON files with a durable hosted database.
- Replace local product-image uploads with object storage.
- Configure the same secret environment values in the hosting provider.
- Keep `SESSION_SECRET` identical across production instances and at least 32 characters.
- Use HTTPS for the production domain.
- Run `npm run check`.
- Test customer OTP, Google sign-in, product approval, order approval, supplier-forwarding lock and logout.
- Make the GitHub repository private after collaboration is complete, as planned.
