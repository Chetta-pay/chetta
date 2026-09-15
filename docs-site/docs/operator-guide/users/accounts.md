---
title: "Accounts"
---

**Dashboard → Users → Accounts**

Browse and manage all users who have authenticated through your app.

---

## User list

| Column | Description |
|---|---|
| **User ID** | ChettaPay user ID (`usr_...`) |
| **Email** | User email — shown if authenticated via email OTP or OAuth with email scope |
| **Provider** | Auth provider used (Google, GitHub, Email, external wallet) |
| **Wallet** | Associated wallet ID and status |
| **Created** | First login timestamp |
| **Last seen** | Most recent activity |

Search by email or user ID. Filter by auth provider or wallet status.

---

## User detail

Click any user to see:

- Auth provider and login history
- Associated wallet — ID, G-address, status, and balances
- Full transaction history
- Option to manually fund/activate their wallet (the **Fund 2 XLM** action lives on **Users → Wallets** for not-yet-funded wallets)