# SOMMS — Smart Organization Maintenance Management System

A scalable, role-driven, state-controlled web application for maintenance operations.

## Quick Start

### With Docker (Recommended)
```bash
docker-compose up -d
docker-compose exec backend node seeders/seedRoles.js
docker-compose exec backend node seeders/seedAdmin.js
```
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- MongoDB: localhost:27017

### Without Docker
```bash
# Terminal 1: Backend
cd backend
cp .env.example .env
npm install
npm run seed
npm run seed:admin
npm run dev

# Terminal 2: Frontend
cd frontend
npm install
npm run dev
```

## Default Admin Login
- Email: admin@somms.com
- Password: Admin@123456

## Tech Stack
- **Frontend:** React, Vite, TailwindCSS
- **Backend:** Node.js, Express, Mongoose
- **Database:** MongoDB
- **Auth:** JWT + RBAC
- **DevOps:** Docker, GitHub Actions, AWS

## API Endpoints

| Module        | Method | Endpoint                    | Auth Required |
|---------------|--------|-----------------------------|:-------------:|
| Auth          | POST   | /api/auth/register          |       ✗       |
| Auth          | POST   | /api/auth/login             |       ✗       |
| Auth          | GET    | /api/auth/me                |       ✓       |
| Tickets       | POST   | /api/tickets                |       ✓       |
| Tickets       | GET    | /api/tickets                |       ✓       |
| Tickets       | GET    | /api/tickets/:id            |       ✓       |
| Tickets       | PATCH  | /api/tickets/:id/status     |       ✓       |
| Tickets       | GET    | /api/tickets/:id/history    |       ✓       |
| Estimates     | POST   | /api/estimates              |       ✓       |
| Estimates     | GET    | /api/estimates/ticket/:id   |       ✓       |
| Estimates     | PATCH  | /api/estimates/:id/approve  |       ✓       |
| Estimates     | PATCH  | /api/estimates/:id/reject   |       ✓       |
| Work Logs     | POST   | /api/work-logs              |       ✓       |
| Work Logs     | GET    | /api/work-logs/ticket/:id   |       ✓       |
| Invoices      | POST   | /api/invoices               |       ✓       |
| Invoices      | GET    | /api/invoices               |       ✓       |
| Payments      | POST   | /api/payments               |       ✓       |
| Locations     | CRUD   | /api/locations              |       ✓       |
| Assets        | CRUD   | /api/assets                 |       ✓       |
| Notifications | GET    | /api/notifications          |       ✓       |
| Analytics     | GET    | /api/analytics/dashboard    |       ✓       |
