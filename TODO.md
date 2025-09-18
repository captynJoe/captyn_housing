In# TODO.md – Tenant SuperApp (PostgreSQL + Prisma + Node.js + Reupdate)

## 🎯 Goal
Develop a Tenant SuperApp where tenants can manage **rent, water, and electricity bills**, while landlords manage **properties & payments**.  
Stack: **PostgreSQL + Prisma + Node.js + Reupdate**.

---

## 📌 Phase 1 – Project Setup
- [x] Initialize Node.js project (`npm init -y`).  
- [x] Install core deps:  
  - [x] `express` (API server)  
  - [x] `prisma` (ORM)  
  - [x] `pg` (PostgreSQL driver)  
  - [x] `dotenv` (env configs)  
  - [x] `reupdate` (migrations + ops)  
- [x] Setup `.env` → include `DATABASE_URL` for PostgreSQL.  
- [x] Run `npx prisma init` → create schema + migrations folder.  
- [x] Configure Reupdate for DB migrations + seeding.  
- [x] Create basic server.js with express and auth routes.

---

## 📌 Phase 2 – Database Schema (Prisma)
- [x] **User model** → roles: TENANT, LANDLORD, ADMIN.  
- [x] **Property model** → linked to landlord.  
- [x] **Unit model** → specific apartment/house unit.  
- [x] **RentPayment model** → amount, due_date, status, penalty.  
- [x] **WaterBill model** → reading, amount, status.  
- [x] **ElectricityBill model** → tokens, amount, status.  
- [x] **Notification model** → reminders, announcements.  

---

## 📌 Phase 3 – API Development
### Auth
- [x] Setup JWT-based auth (register/login).  
- [x] Middleware: role-based access control.  

### Tenant Routes
- [x] `GET /tenant/bills` → fetch rent, water, electricity.  
- [x] `POST /tenant/pay` → initiate payment (mock).  
- [x] `GET /tenant/history` → fetch all payments.  

### Landlord Routes
- [ ] `POST /landlord/property` → create new property.  
- [ ] `POST /landlord/unit` → add unit to property.  
- [ ] `POST /landlord/bill` → add water/electricity bill.  
- [ ] `GET /landlord/payments` → see tenant payments.  

### Admin Routes
- [ ] Manage all users, landlords, tenants.  
- [ ] Oversee transactions + system health.  

---

## 📌 Phase 4 – Payments Integration
- [ ] Integrate **M-Pesa Daraja API (STK push, C2B, B2C)**.  
- [ ] Webhooks for payment confirmation.  
- [ ] Auto-generate digital receipts (PDF).  

---

## 📌 Phase 5 – Notifications
- [ ] Scheduled jobs (Reupdate cron) → send rent reminders.  
- [ ] SMS/Email integration for announcements.  
- [ ] Push notifications (optional).  

---

## 📌 Phase 6 – Testing & Deployment
- [ ] Unit tests (Jest/Supertest).  
- [ ] Seed DB with demo data (Reupdate + Prisma).  
- [ ] Dockerize app (Node + Postgres).  
- [ ] Deploy to **Hetzner/AWS**.  

---

## 📌 Phase 7 – Future Enhancements
- [ ] AI assistant for tenants → auto-FAQ + support.  
- [ ] Predictive billing → estimate next month’s usage.  
- [ ] Multi-property landlord analytics dashboard.  
- [ ] Tenant credit score → based on timely payments.  

---

✅ **End of File**
