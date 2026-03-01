# CAPTYN Housing

MVP backend + static frontend for CAPTYN Housing trust operations.

Current core modules:

- Building registry + CCTV status
- Incident + vacancy snapshots
- Resident support tickets (maintenance/security) with lifecycle + SLA
- Resident auth via phone OTP with house-number + building binding
- Tenant-private report/rent/notification access
- Rent ledger with M-PESA callback ingestion + auto reminders (D-3, D-1, overdue)
- Wi-Fi checkout + provisioning flow
- Protected admin route with role-checked sessions

Storage modes:

- In-memory (no `DATABASE_URL`)
- Prisma + PostgreSQL (`DATABASE_URL` set)
- Guarded fallback to memory (`ALLOW_MEMORY_FALLBACK_ON_DB_ERROR=true`)

## Quick start

1. Install dependencies:

```bash
npm install
```

2. Configure env:

```bash
cp .env.example .env
```

3. Start development server:

```bash
npm run dev
```

API base URL: `http://localhost:4000`

- Public portal: `GET /`
- Resident desk: `GET /users`
- Admin login: `GET /admin/login`
- Protected admin console: `GET /admin`
- Health check: `GET /health`

## One-command local startup

```bash
npm run dev:local
```

Useful DB commands:

```bash
npm run db:up
npm run db:down
npm run db:logs
```

## Auth + security controls

- `WIFI_ADMIN_TOKEN`: admin login token
- `WIFI_ROOT_ADMIN_TOKEN` (optional): root admin login token
- `ADMIN_USERNAME`, `ADMIN_PASSWORD`: admin login credentials
- `ROOT_ADMIN_USERNAME`, `ROOT_ADMIN_PASSWORD` (optional): root admin credentials
- `WIFI_PAYMENT_CALLBACK_TOKEN`: token for Wi-Fi payment confirmation callback
- `MPESA_RENT_CALLBACK_TOKEN`: token for rent M-PESA callback endpoint
- `EXPOSE_DEV_OTP=true` (non-prod): includes OTP code in response for local testing

Resident auth flow:

1. `POST /api/auth/resident/request-otp`
2. `POST /api/auth/resident/verify-otp`
3. Use bearer token for resident APIs

Admin auth flow:

1. `POST /api/auth/admin/login` with either:
   - `{ "accessToken": "..." }`
   - `{ "username": "...", "password": "..." }`
2. Server sets secure `captyn_admin_session` cookie
2. Access protected `/admin`
3. Admin APIs enforce role checks

## Implemented endpoints

Public + shared:

- `GET /health`
- `GET /api/buildings`
- `GET /api/buildings/:buildingId`
- `POST /api/buildings`
- `POST /api/buildings/:buildingId/incidents`
- `PATCH /api/buildings/:buildingId/incidents/:incidentId/resolve`
- `POST /api/buildings/:buildingId/vacancy-snapshots`
- `GET /api/wifi/packages`
- `POST /api/wifi/payments`
- `GET /api/wifi/payments/:checkoutReference`
- `POST /api/wifi/payments/:checkoutReference/confirm`
- `POST /api/payments/mpesa/rent-callback`

Resident auth:

- `POST /api/auth/resident/request-otp`
- `POST /api/auth/resident/verify-otp`
- `GET /api/auth/resident/session`
- `POST /api/auth/resident/logout`

Resident private APIs (tenant-scoped):

- `POST /api/user/reports`
- `GET /api/user/reports`
- `GET /api/user/notifications`
- `GET /api/user/rent-due`

Admin auth:

- `POST /api/auth/admin/login`
- `GET /api/auth/admin/session`
- `POST /api/auth/admin/logout`

Admin APIs (role checked):

- `GET /api/admin/wifi/packages`
- `PATCH /api/admin/wifi/packages/:packageId`
- `GET /api/admin/wifi/payments`
- `GET /api/admin/overview`
- `GET /api/admin/rent-ledger`
- `GET /api/admin/rent-due?houseNumber=...`
- `PUT /api/admin/rent-due/:houseNumber`
- `GET /api/admin/rent-payments`
- `GET /api/admin/tickets`
- `PATCH /api/admin/tickets/:ticketId/status`

## Example resident OTP flow

```bash
curl -X POST http://localhost:4000/api/auth/resident/request-otp \
  -H "content-type: application/json" \
  -d '{
    "buildingId": "CAPTYN-BLDG-00001",
    "houseNumber": "A-12",
    "phoneNumber": "0712345678"
  }'
```

```bash
curl -X POST http://localhost:4000/api/auth/resident/verify-otp \
  -H "content-type: application/json" \
  -d '{
    "challengeId": "otp_xxx",
    "otpCode": "123456"
  }'
```

Then call resident APIs with:

```text
Authorization: Bearer <resident token>
```

## Example M-PESA rent callback

```bash
curl -X POST http://localhost:4000/api/payments/mpesa/rent-callback \
  -H "content-type: application/json" \
  -H "x-mpesa-callback-token: change-me" \
  -d '{
    "houseNumber": "A-12",
    "amountKsh": 3500,
    "providerReference": "QWERTY123",
    "phoneNumber": "0712345678"
  }'
```

## Example ticket lifecycle update (admin)

```bash
curl -X PATCH http://localhost:4000/api/admin/tickets/<ticket-id>/status \
  -H "content-type: application/json" \
  -H "Cookie: captyn_admin_session=<session-cookie>" \
  -d '{
    "status": "in_progress",
    "adminNote": "Assigned to maintenance shift B"
  }'
```

## Development checks

```bash
npm run typecheck
npm test
```
