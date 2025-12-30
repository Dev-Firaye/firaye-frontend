# Vercel Deployment Guide

## Environment Variables

Both frontend applications use the **same environment variable name** but need to be configured **separately** in Vercel since they are separate Next.js projects.

### Required Environment Variable

**Variable Name:** `NEXT_PUBLIC_API_BASE_URL`

**Description:** The base URL of your backend API Gateway

**Example Values:**
- Development: `http://localhost:8000`
- Production: `https://api.yourdomain.com` or `https://your-api.vercel.app`

---

## Deployment Setup

### Option 1: Separate Vercel Projects (Recommended)

Deploy each app as a separate Vercel project:

#### 1. Merchant Dashboard Project
- **Project Name:** `firaye-merchant-dashboard` (or your preferred name)
- **Root Directory:** `merchant-dashboard`
- **Framework Preset:** Next.js
- **Environment Variables:**
  ```
  NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
  ```

#### 2. User App Project
- **Project Name:** `firaye-user-app` (or your preferred name)
- **Root Directory:** `user-app`
- **Framework Preset:** Next.js
- **Environment Variables:**
  ```
  NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
  ```

### Option 2: Monorepo with Vercel

If using Vercel's monorepo support:

1. Create a single Vercel project
2. Configure multiple apps in `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "merchant-dashboard/package.json",
      "use": "@vercel/next"
    },
    {
      "src": "user-app/package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/merchant/(.*)",
      "dest": "merchant-dashboard/$1"
    },
    {
      "src": "/user/(.*)",
      "dest": "user-app/$1"
    }
  ]
}
```

---

## Step-by-Step Vercel Deployment

### For Merchant Dashboard:

1. **Go to Vercel Dashboard** → New Project
2. **Import Git Repository** (GitHub/GitLab/Bitbucket)
3. **Configure Project:**
   - **Root Directory:** `merchant-dashboard`
   - **Framework Preset:** Next.js (auto-detected)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)
4. **Add Environment Variable:**
   - Key: `NEXT_PUBLIC_API_BASE_URL`
   - Value: Your production API URL (e.g., `https://api.yourdomain.com`)
   - Environment: Production, Preview, Development (select all)
5. **Deploy**

### For User App:

1. **Go to Vercel Dashboard** → New Project
2. **Import Git Repository** (same repo or separate)
3. **Configure Project:**
   - **Root Directory:** `user-app`
   - **Framework Preset:** Next.js (auto-detected)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)
4. **Add Environment Variable:**
   - Key: `NEXT_PUBLIC_API_BASE_URL`
   - Value: Your production API URL (same as merchant dashboard)
   - Environment: Production, Preview, Development (select all)
5. **Deploy**

---

## Environment Variable Values

### Development (Local)
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### Production (Vercel)
```
NEXT_PUBLIC_API_BASE_URL=https://api.firaye.com
```

Or if your API is also on Vercel:
```
NEXT_PUBLIC_API_BASE_URL=https://your-api-project.vercel.app
```

**Note:** If using `api.firaye.com`, make sure you've:
1. Configured DNS to point to your backend server
2. Set up SSL/TLS certificate
3. Updated CORS in backend to allow your Vercel domains
4. See `DOMAIN_SETUP.md` in the backend repo for detailed instructions

---

## Important Notes

1. **Same Variable Name, Separate Projects:** Both apps use `NEXT_PUBLIC_API_BASE_URL`, but you need to set it in each Vercel project separately.

2. **NEXT_PUBLIC_ Prefix:** The `NEXT_PUBLIC_` prefix is required for Next.js to expose the variable to the browser. Without it, the variable won't be accessible in client-side code.

3. **CORS Configuration:** Make sure your backend API Gateway has CORS configured to allow requests from your Vercel domains:
   - `https://your-merchant-app.vercel.app`
   - `https://your-user-app.vercel.app`

4. **Cookie Settings:** In production, you may need to adjust cookie settings:
   - `secure: true` (for HTTPS)
   - `sameSite: 'none'` (if frontend and backend are on different domains)

---

## Verifying Deployment

After deployment, check:

1. **Merchant Dashboard:** `https://your-merchant-app.vercel.app`
2. **User App:** `https://your-user-app.vercel.app`

Both should:
- Load without errors
- Be able to login
- Make API calls successfully

Check browser console for any API errors.

---

## Troubleshooting

### API Calls Failing

1. **Check Environment Variable:**
   - Go to Vercel Project Settings → Environment Variables
   - Verify `NEXT_PUBLIC_API_BASE_URL` is set correctly
   - Redeploy after adding/changing variables

2. **Check CORS:**
   - Verify backend allows your Vercel domain
   - Check browser console for CORS errors

3. **Check API URL:**
   - Verify the API URL is accessible
   - Test with: `curl https://api.yourdomain.com/health`

### Build Errors

1. **Check Node Version:**
   - Vercel uses Node 18.x by default
   - Both apps require Node 18+

2. **Check Dependencies:**
   - Ensure `package.json` has all dependencies
   - Run `npm install` locally to verify

---

## Example Vercel Configuration

### merchant-dashboard/vercel.json (Optional)
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_API_BASE_URL": "@api-base-url"
  }
}
```

### user-app/vercel.json (Optional)
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_API_BASE_URL": "@api-base-url"
  }
}
```

---

## Summary

- **One environment variable:** `NEXT_PUBLIC_API_BASE_URL`
- **Two separate Vercel projects:** One for merchant-dashboard, one for user-app
- **Same variable value:** Both projects use the same API URL
- **Set in each project:** Configure the environment variable in each Vercel project separately

