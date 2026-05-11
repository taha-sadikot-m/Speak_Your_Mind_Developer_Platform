# SYM Developer Portal (Standalone)

This is the standalone frontend for the SYM Developer Portal, prepared for deployment as a separate repository on Vercel.

## Tech Stack

- Vite + React + TypeScript
- Tailwind CSS + Framer Motion
- Axios for API communication

## Prerequisites

### Backend Requirements
This frontend requires a running SYM backend API. See [BACKEND_SETUP.md](./BACKEND_SETUP.md) for:
- Required backend endpoints
- CORS configuration
- Environment variables
- Deployment checklist

### Environment Variables
Copy `.env.example` to `.env.local` and set:
```
VITE_API_URL=http://127.0.0.1:8000
```

## Local Development

### 1. Install dependencies
```bash
npm install
```

### 2. Start dev server
```bash
npm run dev
```

The app will be available at `http://localhost:5174`.

### 3. Backend URL
By default, the app expects the backend at `http://127.0.0.1:8000`.
To use a different backend URL, set `VITE_API_URL` in `.env.local`.

## Build

```bash
npm run build
```

Output will be in the `dist/` folder.

## Deployment: Vercel

### Step 1: Create GitHub Repository
Push this folder to a new GitHub repository:
```bash
git init
git add .
git commit -m "Initial developer portal"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/your-repo.git
git push -u origin main
```

### Step 2: Import on Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. **Framework**: Vite (auto-detected)
5. **Build Command**: `npm run build`
6. **Output Directory**: `dist`
7. Click "Deploy"

### Step 3: Add Environment Variable
1. In Vercel project, go to Settings → Environment Variables
2. Add new variable:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://your-backend-url.com` (or your production backend domain)
3. Redeploy: Click "Redeploy" or push a new commit

### Step 4: Backend CORS Configuration
Update your backend to allow requests from your Vercel URL:
```
CORS_ALLOWED_ORIGINS=https://your-app.vercel.app,http://127.0.0.1:5174
```

**See [BACKEND_SETUP.md](./BACKEND_SETUP.md) for complete backend configuration.**

## Backend Configuration Checklist

- [ ] Backend API is running and accessible
- [ ] Backend has `/api/v1/dev-portal/*` endpoints for portal features
- [ ] Backend has `/api/v1/developer/*` endpoints for public API
- [ ] CORS includes your Vercel URL in `CORS_ALLOWED_ORIGINS`
- [ ] `FRONTEND_URL` set on backend (for redirects/emails)
- [ ] Gemini API key configured on backend for AI analysis
- [ ] Database tables created on backend

## Troubleshooting

### CORS Error During Deployment
**Error**: `Access to XMLHttpRequest has been blocked by CORS policy`
**Solution**: Add your Vercel URL to backend `CORS_ALLOWED_ORIGINS` and redeploy backend.

### 401 Unauthorized / Cannot Log In
**Error**: `POST /api/v1/dev-portal/auth/login/ 401`
**Solution**: Verify backend is running and CORS is configured. Check Network tab in DevTools.

### API 404 Not Found
**Error**: `GET /api/v1/dev-portal/dashboard/ 404`
**Solution**: Verify `VITE_API_URL` is set correctly and backend has all required endpoints.

### Large Bundle Warning
You may see a warning about the JS bundle being >500 KB. This is non-blocking and can be optimized later with code splitting.

## API Integration

The frontend communicates with two API groups:

1. **Portal API** (JWT authenticated)
   - Admin/portal-only features (user profile, API key management, etc.)
   - Requires dev_access_token from login

2. **Public API** (X-API-Key authenticated)
   - Public interview creation, status polling
   - Rate-limited per API key

See [BACKEND_SETUP.md](./BACKEND_SETUP.md) for endpoint details.

## Project Structure

```
src/
├── components/      # React components (pages, layouts, etc.)
├── pages/           # Page-level components
├── services/        # API communication (axios clients)
├── types/           # TypeScript interfaces
├── hooks/           # Custom React hooks
├── utils/           # Utility functions
├── App.tsx          # Root component
└── main.tsx         # Vite entry point
```

## License

© 2026 Speak Your Mind
