# Connect thundrainternational.com (Hostinger DNS → Vercel)

The domain is registered and both of its nameservers are Hostinger's, so **all records are
added in Hostinger hPanel, not in Vercel**. Vercel only receives the traffic.

Verified state at the time of writing:

| Check | Result | Meaning |
| --- | --- | --- |
| `NS thundrainternational.com` | `athena.dns-parking.com`, `apollo.dns-parking.com` | DNS is managed by Hostinger |
| `A thundrainternational.com` | `2.57.91.91` | Hostinger parking page — **must be replaced** |
| `MX` / `TXT` on apex | no records | no mail records yet |
| `send.thundrainternational.com` | does not exist | Resend sending domain not set up |

For comparison, the old domain is already correctly connected and can be used as a reference:
`fetchwow.online` → `216.198.79.1`, `www.fetchwow.online` CNAME →
`2b6cc054bd5c2d95.vercel-dns-017.com`, and `send.fetchwow.online` resolves SPF + MX + DKIM.
Because both domains attach to the same Vercel project, the new domain will very likely be
issued the same two values — but the cards shown when you add the domain remain authoritative.

## 1. Get the exact values from Vercel

Never copy an IP from a blog post or from the old domain — Vercel assigns newer projects an
address from an anycast pool, and the domain card in your project is the only source of truth.

1. Open Vercel → project `dropshipping-store` → **Settings → Domains**.
2. **Add Domain** → type `thundrainternational.com` (no `https://`, no `www.`, no trailing dot).
3. Vercel creates two entries, the apex and `www`. Read the values off each card:
   - apex card → an **A** record value (often `76.76.21.21`, but newer projects get a value such as `216.198.79.1`)
   - `www` card → a **CNAME** target (often `cname.vercel-dns.com`, but it may be a project-specific name such as `d1d4fc829fe7bc7c.vercel-dns-017.com`)
4. Leave the tab open — you will paste these two values into Hostinger.

## 2. Point the domain at Vercel (Hostinger hPanel)

hPanel → **Domains** → `thundrainternational.com` → **DNS / Nameservers** → **Manage DNS records**.

**Delete the parking record first.** There is an existing `A` record on `@` pointing at
`2.57.91.91`. If it is left in place alongside Vercel's, traffic splits between the parking
page and the store, and Vercel keeps reporting *Invalid Configuration*. Hostinger also
auto-creates a `CNAME` on `www` pointing back at the apex (`thundrainternational.com`); delete
it or edit it in place, because adding a second record on `www` fails with the red error
*"DNS resource record is not valid or conflicts with another resource record"*. Two competing
records on the same hostname cause intermittent failures.

Then add:

| Type | Name / Host | Value / Points to | TTL |
| --- | --- | --- | --- |
| A | `@` | the A value from your Vercel apex card | 3600 (or Auto) |
| CNAME | `www` | the CNAME target from your Vercel `www` card | 3600 (or Auto) |

Notes on Hostinger's form:

- The **Name** field takes the bare label. Type `@` for the apex and `www` for the subdomain —
  Hostinger appends `.thundrainternational.com` for you. Do not type the full domain name.
- The CNAME value must not end in a dot unless Hostinger asks for it.
- If a CNAME record on `@` is rejected, that is expected: the DNS spec forbids a CNAME at the
  apex, which is exactly why the apex uses an A record.

## 3. Add the Resend sending records

The app sends order and sign-in emails from `orders@send.thundrainternational.com`. Create
these three records in the **same Hostinger zone**.

**This is the step that broke last time.** The `send` records were published at
`send.send.fetchwow.online` because the full hostname was typed into the Name field. Type only
the label shown below — Hostinger appends the domain, so `send` becomes
`send.thundrainternational.com`, and `resend._domainkey.send` becomes
`resend._domainkey.send.thundrainternational.com`.

| Type | Name / Host | Value | Priority |
| --- | --- | --- | --- |
| TXT | `send` | `v=spf1 include:amazonses.com ~all` | — |
| MX | `send` | `feedback-smtp.ap-northeast-1.amazonses.com` | `10` |
| TXT | `resend._domainkey.send` | the long `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GN...` key from Resend | — |

Get the DKIM value from Resend → **Domains** → add/verify `send.thundrainternational.com` →
copy the TXT value it displays. It is unique to your account, so do not reuse the one from the
old domain. If Resend offers an MX value different from the one above, use Resend's.

Then press **Verify** in Resend and wait for the domain to show **Verified**.

## 4. Verify the records resolve

From any machine with Node available:

```bash
node -e "
const dns=require('dns').promises;const rs=new dns.Resolver();rs.setServers(['8.8.8.8']);
(async()=>{for(const d of ['thundrainternational.com','www.thundrainternational.com']){
try{console.log(d,'A',await rs.resolve4(d));}catch(e){console.log(d,'A',e.code);}
}
for(const d of ['send.thundrainternational.com','resend._domainkey.send.thundrainternational.com']){
try{console.log(d,'TXT',JSON.stringify(await rs.resolveTxt(d)));}catch(e){console.log(d,'TXT',e.code);}
}
try{console.log('send MX',await rs.resolveMx('send.thundrainternational.com'));}catch(e){console.log('send MX',e.code);}
})();"
```

Expected once propagated:

- apex `A` → the Vercel value from your domain card (not `2.57.91.91`)
- `www` → resolves through the CNAME
- `send` `TXT` → `v=spf1 include:amazonses.com ~all`
- `send` `MX` → `feedback-smtp.ap-northeast-1.amazonses.com` priority `10`
- `resend._domainkey.send` `TXT` → the `p=MIGf...` key

Propagation usually takes minutes but can take up to 48 hours. Vercel provisions the SSL
certificate automatically once the apex and `www` records are valid, and the domain card turns
green.

## 5. Finish in Vercel and Google

1. Vercel → project → **Settings → Environment Variables**, set or update:

   ```env
   NEXT_PUBLIC_SITE_URL=https://thundrainternational.com
   ORDER_EMAIL_FROM=Thundra International Orders <orders@send.thundrainternational.com>
   ```

   Apply both to Production and Preview, then **redeploy** — `NEXT_PUBLIC_*` values are baked in
   at build time, so an env change without a redeploy does nothing.

2. Google Cloud Console → APIs & Services → Credentials → the OAuth Web client:
   - Authorized JavaScript origin: `https://thundrainternational.com`
   - Authorized redirect URI: `https://thundrainternational.com/api/auth/google/callback`

3. Smoke test: open `https://thundrainternational.com`, confirm the header reads
   *Thundra International.*, sign in by email (a code should arrive), sign in with Google, and
   place a test order.

## Troubleshooting

| Symptom | Cause |
| --- | --- |
| Vercel shows *Invalid Configuration* | The parking `A` record on `@` still exists, or the auto-created `www` CNAME still points at the apex |
| Red *"DNS resource record is not valid or conflicts with another resource record"* in Hostinger | A record with the same Name already exists (Hostinger auto-creates `www` as a CNAME to the apex). Edit that row with the pencil or delete it; a CNAME name can hold only one record |
| Vercel shows *No Configuration* | Records not added, or added at a different DNS host than Hostinger |
| Browser still shows the parking page | DNS not propagated yet, or a cached record — retry on another network |
| Resend stays *Not verified* | A record was entered as `send.send` or `resend._domainkey.send.send`; delete and re-add with the bare label. Also check the DKIM row's **content**: it must be the `p=MIGf...` key copied from Resend, not the domain name |
| 503 "Email service is not configured" | `RESEND_API_KEY` missing, or the Resend domain is not Verified |
| Google sign-in returns `redirect_uri_mismatch` | The redirect URI in Google does not exactly match `https://thundrainternational.com/api/auth/google/callback` |
