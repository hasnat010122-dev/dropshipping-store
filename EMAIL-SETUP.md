# Fix “Email service is not configured”

The live API currently returns HTTP 503 because Vercel does not have a usable Resend configuration.

## 1. Correct Hostinger DNS

For the Resend sending domain `send.fetchwow.online`, the current SPF and MX records are mistakenly published at `send.send.fetchwow.online`.

In Hostinger DNS, change these two record names from `send.send` to `send`:

- TXT, Name `send`, Value `v=spf1 include:amazonses.com ~all`
- MX, Name `send`, Priority `10`, Value `feedback-smtp.ap-northeast-1.amazonses.com`

Keep the existing DKIM TXT record because `resend._domainkey.send.fetchwow.online` is resolving correctly.

Return to Resend -> Domains and press Verify. Wait until the domain is Verified.

## 2. Create a Resend API key

In Resend -> API Keys, create a key with Sending access. Copy it once. Never put it in GitHub or send it to anyone.

## 3. Add Vercel variables

In Vercel -> dropshipping-store -> Settings -> Environment Variables, add:

- Key `RESEND_API_KEY`; value is the private key beginning `re_`
- Key `ORDER_EMAIL_FROM`; value `FetchWow <orders@send.fetchwow.online>`

Enable both for Production and Preview. Redeploy the latest Production deployment after saving.

## 4. Test

Open `/account/login`, enter an email you can access, and press Continue with email. A six-digit code should arrive. Check Vercel runtime logs and Resend Logs if it does not.
