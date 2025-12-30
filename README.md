# Firaye Frontend

Production-ready frontend applications for the Firaye time-bound access control platform.

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
