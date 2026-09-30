# Fix “Email service is not configured”

The live API currently returns HTTP 503 because Vercel does not have a usable Resend configuration.

## 1. Resend sending domain DNS

**The `send.send` DNS bug described here has already been fixed on the old domain and no
longer applies.** Live checks confirm `send.fetchwow.online` now resolves correctly:

- `TXT send.fetchwow.online` → `v=spf1 include:amazonses.com ~all`
- `MX send.fetchwow.online` → `feedback-smtp.ap-northeast-1.amazonses.com` priority `10`
- `TXT resend._domainkey.send.fetchwow.online` → `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GN...`

The store has since been rebranded to **Thundra International**, so the sending domain becomes
`send.thundrainternational.com` and these three records must be created again on the new
domain. See [`DOMAIN-DNS-SETUP.md`](./DOMAIN-DNS-SETUP.md) step 3 for the exact records and the
Hostinger Name-field gotcha that caused the original `send.send` mistake.

Records required, entered in Hostinger with the bare label only:

- TXT, Name `send`, Value `v=spf1 include:amazonses.com ~all`
- MX, Name `send`, Priority `10`, Value `feedback-smtp.ap-northeast-1.amazonses.com`
- TXT, Name `resend._domainkey.send`, Value the `p=MIGf...` key shown by Resend

Return to Resend -> Domains and press Verify. Wait until the domain is Verified.

## 2. Create a Resend API key

In Resend -> API Keys, create a key with Sending access. Copy it once. Never put it in GitHub or send it to anyone.

## 3. Add Vercel variables

In Vercel -> dropshipping-store -> Settings -> Environment Variables, add:

- Key `RESEND_API_KEY`; value is the private key beginning `re_`
- Key `ORDER_EMAIL_FROM`; value `Thundra International <orders@send.thundrainternational.com>`

Enable both for Production and Preview. Redeploy the latest Production deployment after saving.

## 4. Test

Open `/account/login`, enter an email you can access, and press Continue with email. A six-digit code should arrive. Check Vercel runtime logs and Resend Logs if it does not.
