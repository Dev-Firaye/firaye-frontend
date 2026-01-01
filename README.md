# Firaye Frontend

Production-ready frontend applications for the Firaye time-bound access control platform.

---

## 🧠 Firaye Project - Cursor Memory Recovery Instruction Guide

**This is a living document that must be referenced by Cursor each time it forgets prior progress, roles, naming conventions, project goals, or instructions. Do not proceed without reading and confirming understanding.**

### 🏛️ Project Name: Firaye

Firaye is a dual-platform (frontend + backend) application composed of:

- **firaye-frontend** (Next.js)
- **firaye-core** (Python/FastAPI)

It is being deployed to:

- **Vercel** (for frontend)
- **Render** (for backend)

**Domains:**

- `merchant.firaye.com` → merchant dashboard (Vercel)
- `app.firaye.com` → customer-facing app (Vercel)
- `api.firaye.com` → FastAPI backend (Render)

### 🔹 CONTEXT YOU MUST NEVER FORGET

**GitHub Organization & Repositories:**

All source code is hosted in the **Dev-Firaye** GitHub organization under two separate repositories:

- **firaye-core** → Python FastAPI backend
- **firaye-frontend** → Next.js frontend (with `/merchant-dashboard` and `/user-app` folders)

**Branch Strategy:**

- Use **`dev` branch** for all staging/pre-production updates
- Use **`main` branch** only for production-ready deployments
- Do not create new repos unless explicitly instructed
- Push structured commits with relevant context (e.g., "fix: connect merchant dashboard to access key API")
- If the remote repositories are not yet linked locally, initialize using `git remote add`, and ensure Vercel (frontend) and Render (backend) are correctly linked to the corresponding GitHub repo and branch

**We are not creating a new project, we are continuing work on an existing project where the deployments are already in place.**

You have previously received and executed commands related to:

- Creating subdomains on Namecheap
- Linking Vercel to the correct GitHub repo and root directory
- Editing environment variables (`NEXT_PUBLIC_API_BASE_URL`, etc.)
- Styling issues (e.g., responsiveness, mobile layout fixes)
- Rendering issues during Vercel build
- Adjusting project structure and deployment settings

You have previously deployed:

- **firaye-frontend** via Vercel (see: deployed merchant dashboard screenshot)
- **firaye-core** via Render (using free tier, build: `poetry install`, start: `uvicorn main:app ...`)

You confirmed the merchant dashboard is connected to `merchant.firaye.com` but Vercel showed "Invalid Configuration" until the CNAME was added to Namecheap. You must know what this means.

You were instructed to test and confirm:

- If deployments are mobile-responsive
- If the frontend is using the correct subdomain in `.env` or Vercel env vars

### 💬 INSTRUCTIONS TO YOU, CURSOR (each time you run)

**"Before doing anything, review this doc and re-establish memory of the Firaye project. Check domain mappings, previous deployments, what repo and folder you are editing, and what still needs to be done."**

If unsure of what to do:

- Ask: "Should I be working on firaye-core or firaye-frontend right now?"
- Confirm: "Which subdomain does this connect to?"
- Do not suggest new project setups unless explicitly instructed.

### ✨ Final Command Summary (Last Known Setup)

**firaye-frontend**

- Hosted on Vercel
- Subdomain: `merchant.firaye.com` (merchant dashboard), `app.firaye.com` (user app)
- Directory: `/merchant-dashboard` or `/user-app`
- Env var: `NEXT_PUBLIC_API_BASE_URL=https://api.firaye.com` (must point to API Gateway, not frontend domain!)

**firaye-core**

- Hosted on Render (free tier)
- Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Build command: `poetry install && alembic upgrade head` (includes database migrations)
- Subdomain: will be `api.firaye.com`
- **CRITICAL**: Must set `DATABASE_URL` environment variable in Render to your Render PostgreSQL connection string (NOT localhost!)

---

## 📁 Project Structure

```
firaye-frontend/
├── merchant-dashboard/    # Merchant-facing dashboard (port 3001)
│   ├── app/
│   │   ├── login/        # Login page
│   │   ├── dashboard/    # Main dashboard with metrics
│   │   ├── products/     # Product management (list, create, edit, delete)
│   │   ├── products/[id]/ # Product detail with key management
│   │   ├── keys/         # All access keys view
│   │   ├── logs/         # Activity logs (placeholder)
│   │   └── settings/     # Merchant settings (placeholder)
│   ├── components/       # Reusable components (Sidebar, AuthGuard)
│   └── lib/             # API client and utilities
│
└── user-app/             # User-facing application (port 3002)
    ├── app/
    │   ├── login/       # User login
    │   ├── keys/        # User's access keys
    │   └── profile/     # User profile
    ├── components/       # Reusable components (Navbar, AuthGuard)
    └── lib/             # API client and utilities
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Backend API running (default: http://localhost:8000)

### Installation

#### Merchant Dashboard

```bash
cd merchant-dashboard
npm install
```

#### User App

```bash
cd user-app
npm install
```

### Environment Variables

Create `.env.local` in each app directory:

```bash
# merchant-dashboard/.env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

# user-app/.env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### Development

#### Run Merchant Dashboard

```bash
cd merchant-dashboard
npm run dev
```

Access at: http://localhost:3001

#### Run User App

```bash
cd user-app
npm run dev
```

Access at: http://localhost:3002

### Production Build

```bash
# Merchant Dashboard
cd merchant-dashboard
npm run build
npm start

# User App
cd user-app
npm run build
npm start
```

## 🎨 Features

### Merchant Dashboard

- **Authentication**: JWT-based login with secure cookie storage
- **Dashboard**: Overview with key metrics and recent activity
- **Product Management**: Full CRUD operations for products
- **Access Key Management**: Generate and revoke keys for products
- **Activity Logs**: View key events (placeholder for /access/logs endpoint)
- **Settings**: Configure webhooks and notifications (placeholder)

### User App

- **Authentication**: User login to access their keys
- **Key Management**: View all active access keys
- **Product Access**: Redirect to merchant URLs when keys are valid
- **Profile**: View user information and account status

## 🔐 Authentication

Both apps use JWT authentication:

1. User logs in via `/login`
2. JWT token stored in HttpOnly cookie (`firaye_token`)
3. Token automatically included in API requests
4. AuthGuard component protects authenticated routes
5. Token refresh handled automatically on 401 errors

## 🎨 Branding

- **Font**: Inter (loaded via Google Fonts)
- **Primary Color**: #00A676 (Firaye Green)
- **Logo**: Text-based "firaye" in Inter font (lowercase)

## 📡 API Integration

### Implemented Endpoints

- `POST /auth/login` - User authentication
- `GET /auth/me` - Get current user
- `GET /auth/products` - List merchant products
- `POST /auth/products` - Create product
- `GET /auth/products/{id}` - Get product details
- `PUT /auth/products/{id}` - Update product
- `DELETE /auth/products/{id}` - Delete product
- `POST /access/keys` - Create access key
- `GET /access/admin/keys` - List all keys
- `DELETE /access/keys/{key}` - Revoke key
- `POST /access/validate` - Validate key (used by external apps)

### Placeholder Endpoints

These endpoints are referenced but not yet implemented in the backend:

- `GET /access/summary` - Dashboard metrics
- `GET /access/logs` - Activity logs
- `POST /webhook` - Webhook configuration

The frontend includes placeholders that will work once these endpoints are implemented.

## 🛠️ Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Axios** - HTTP client
- **js-cookie** - Cookie management
- **Heroicons** - Icon library

## 📦 Deployment

### Vercel (Recommended)

Each app can be deployed separately to Vercel:

1. Connect GitHub repository
2. Set root directory:
   - Merchant Dashboard: `merchant-dashboard`
   - User App: `user-app`
3. Configure environment variables
4. Deploy

### Custom Domain Setup

- **Merchant Dashboard**: `dashboard.firaye.com`
- **User App**: `app.firaye.com`

## 🔧 Development Notes

### Port Configuration

- Merchant Dashboard: Port 3001
- User App: Port 3002

This allows both apps to run simultaneously during development.

### API Client

Both apps use a shared API client pattern (`lib/api.ts`) that:
- Automatically includes JWT tokens
- Handles token refresh on 401 errors
- Redirects to login on authentication failure

### Component Structure

- **AuthGuard**: Protects routes requiring authentication
- **Sidebar** (Merchant): Navigation sidebar for dashboard
- **Navbar** (User): Top navigation bar for user app

## 📝 Next Steps

1. **Backend Endpoints**: Implement `/access/summary`, `/access/logs`, and `/webhook`
2. **User Key Filtering**: Update `/access/admin/keys` to filter by current user for user app
3. **Product Detail Page**: Add edit functionality for products
4. **Error Handling**: Enhance error messages and retry logic
5. **Loading States**: Add skeleton loaders for better UX
6. **Responsive Design**: Ensure mobile-friendly layouts

## 🐛 Troubleshooting

### Port Already in Use

If ports 3001 or 3002 are in use, modify the dev script in `package.json`:

```json
{
  "scripts": {
    "dev": "next dev -p 3003"  // Change port
  }
}
```

### API Connection Issues

1. Verify backend is running on `http://localhost:8000`
2. Check `NEXT_PUBLIC_API_BASE_URL` in `.env.local`
3. Ensure CORS is configured on backend

### Authentication Issues

1. Clear cookies and try logging in again
2. Check browser console for errors
3. Verify JWT token is being stored correctly

## 📚 Documentation

- [Integration Guide](../firaye-core/docs/INTEGRATION.md) - For external developers
- [API Reference](../firaye-core/docs/API.md) - Backend API documentation
- [Development Guide](../firaye-core/docs/DEVELOPMENT.md) - Backend development setup

## 📄 License

See LICENSE file for details.
