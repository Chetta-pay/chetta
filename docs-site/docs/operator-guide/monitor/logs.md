---
title: "Logs"
---

**Dashboard → Monitor → Logs**

API request logs, errors, and webhook delivery history for your app.

---

## API logs

Every request made to the ChettaPay Server using your app's keys is logged:

| Column         | Description                                            |
| -------------- | ------------------------------------------------------ |
| **Timestamp**  | Request time                                           |
| **Endpoint**   | HTTP method and path                                   |
| **Key**        | Which API key made the request (publishable or secret) |
| **Status**     | HTTP response code                                     |
| **Latency**    | Response time in milliseconds                          |
| **Error code** | ChettaPay error code if the request failed                |

Logs are retained for **30 days**.

Filter by key, status code, endpoint, or date range. Use this to:

- Audit which key made which request

- Identify unauthorized usage after a key is compromised

- Debug integration issues

---

## Webhook delivery logs

Every webhook delivery attempt is logged with the event type, destination URL, response code, and latency. Failed deliveries show the error and retry schedule.

Access webhook logs from **Dashboard → Build → Webhooks → Event log**.
