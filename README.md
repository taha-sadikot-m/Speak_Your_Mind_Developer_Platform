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

## Development: Local Setup

### Prerequisites
- Node.js 18+
- Backend running locally: `http://127.0.0.1:8000`

### 1. Install dependencies
```bash
npm install
```

### 2. Start dev server
```bash
npm run dev
```

The app will be available at `http://localhost:5174`.

### 3. Environment Variable
- `.env.local` already defaults to `http://127.0.0.1:8000`
- No setup needed for local dev

## Build

```bash
npm run build
```

Output will be in the `dist/` folder.

## Deployment: Vercel + Render Backend

This frontend is designed to work with your **Render backend** (like your main frontend).

### Prerequisites
- Backend running on Render: `https://sym-ecosystem-backend.onrender.com`
- GitHub repository created from this folder
- Vercel account (free tier is fine)

### Step 1: Deploy to Vercel

1. **Go to [vercel.com](https://vercel.com)**
2. **Click "Add New..." → "Project"**
3. **Import your GitHub repository**
4. **Framework**: Vite (auto-detected)
5. **Build Command**: `npm run build`
6. **Output Directory**: `dist`
7. **Environment Variables**: Add this variable:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://sym-ecosystem-backend.onrender.com`
8. **Click "Deploy"** → Wait for build to complete

### Step 2: Get Your Vercel URL

After deployment completes:
- Vercel will show: `https://your-dev-portal.vercel.app` (or similar)
- **Copy this URL**

### Step 3: Update Render Backend CORS

1. **Go to Render Dashboard**
2. **Click on your backend service** (`sym-ecosystem-backend` or similar)
3. **Go to "Environment" tab**
4. **Find `CORS_ALLOWED_ORIGINS` variable**
5. **Add your Vercel URL**:
   ```
   https://your-dev-portal.vercel.app,http://127.0.0.1:5174
   ```
6. **Click "Save"**
7. **Go to "Deploys" tab**
8. **Click "Manual Deploy"** to restart the backend

### Step 4: Test Connection

1. **Visit your Vercel frontend URL**
2. **Try to log in**
3. **Check DevTools Network tab** (F12 → Network)
4. **Look for POST to `/api/v1/dev-portal/auth/login/`**
   - ✅ Status 200/401 = Connected ✓
   - ❌ CORS error = Update Render CORS (Step 3)
   - ❌ Network error = Render backend not running

### Troubleshooting

| Problem | Solution |
|---------|----------|
| CORS blocked error | Add Vercel URL to Render `CORS_ALLOWED_ORIGINS` and redeploy |
| Cannot log in (401) | Check backend CORS first, then verify credentials |
| Cannot reach API (network error) | Verify `https://sym-ecosystem-backend.onrender.com` is accessible |
| 404 on login endpoint | Backend might not have dev-portal endpoints |

---

## Development: Local Setup

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
