---
title: "Domains"
---

**Dashboard → Build → Domains**

Configure the allowed origins so the ChettaPay SDK can make requests from your app. Requests from unlisted origins are rejected.

---

## Adding a domain

Click **Add domain** and enter your origin including the protocol:

```
http://localhost:3000
https://yourapp.com
https://staging.yourapp.com
```

Changes take effect immediately — no redeployment required.

---

## Common issues

**SDK throws `Origin not allowed`**
Your app's domain is not in the allowed list. Add it in **Dashboard → Build → Domains**.

**Localhost not working**
Add `http://localhost:3000` (or your local port) explicitly. Wildcard subdomains are not supported.

**Staging environment blocked**
Add each environment URL separately — `https://staging.yourapp.com`, `https://preview.yourapp.com`, etc.