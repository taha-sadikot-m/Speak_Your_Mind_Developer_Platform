# Developer Portal – Backend & Environment Setup

## 🚀 Quick Start for Vercel + Render

### Add to Vercel Project Settings → Environment Variables
```
VITE_API_URL=https://sym-ecosystem-backend.onrender.com
```

That's it! Your frontend will connect to your Render backend.

---

## Frontend Environment Variables

### Required
- `VITE_API_URL` - Backend API base URL
  - **Production (Render)**: `https://sym-ecosystem-backend.onrender.com`
  - Local dev: `http://127.0.0.1:8000`

### What happens if not set
- Falls back to `https://api.speakyourmind.app` if deployed (PROD)
- Falls back to `http://127.0.0.1:8000` if local development

## Backend Requirements

### 1. CORS Configuration (CRITICAL ⚠️)

Your **Render backend** MUST allow requests from your **Vercel frontend URL**.

**In Render Backend Settings**, add your Vercel URL to `CORS_ALLOWED_ORIGINS`:

```
CORS_ALLOWED_ORIGINS=https://your-dev-portal.vercel.app,http://127.0.0.1:5174
```

**Step-by-step:**
1. Go to Render Dashboard → Your Backend Service
2. Go to "Environment" tab
3. Find/Edit `CORS_ALLOWED_ORIGINS` variable
4. Add: `https://your-dev-portal.vercel.app`
5. Click "Save"
6. Go to "Deploys" tab
7. Click "Manual Deploy" to restart backend

**⚠️ If you get CORS error after Vercel deploys:**
- Copy your Vercel URL (from Vercel Deployments page)
- Add it to Render `CORS_ALLOWED_ORIGINS`
- Redeploy Render backend
- Refresh your Vercel frontend

### 2. Required Backend Endpoints

The developer portal calls these endpoints:

#### Portal API (JWT authenticated)
- `/api/v1/dev-portal/auth/login/` - Login with email/password
- `/api/v1/dev-portal/profile/` - User profile
- `/api/v1/dev-portal/dashboard/` - Stats & quota
- `/api/v1/dev-portal/api-keys/` - API key management
- `/api/v1/dev-portal/sets/` - Question sets (CRUD)
- `/api/v1/dev-portal/sessions/` - Interview sessions
- `/api/v1/dev-portal/progress-reports/` - Progress report management

#### Public API (X-API-Key authenticated)
- `/api/v1/developer/sessions/` - Create/list sessions
- `/api/v1/developer/sessions/{room_id}/` - Get session status
- `/api/v1/developer/sessions/{room_id}/analysis/` - Get AI analysis
- `/api/v1/developer/progress-reports/` - Batch progress reports

### 3. Backend Environment Variables Required

```
# Core
SECRET_KEY=your-secret-key
DEBUG=false
ENVIRONMENT=production

# Database
DATABASE_URL=postgresql://...

# AI/ML Services
GEMINI_API_KEY=your-gemini-key
GEMINI_DEVELOPER_ANALYSIS_MODEL=gemini-2.5-flash

# Email (optional, for webhooks)
RESEND_API_KEY=your-resend-key
RESEND_FROM_EMAIL=noreply@symedu.in

# CORS
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app,http://127.0.0.1:5174
FRONTEND_URL=https://your-frontend.vercel.app

# Optional: Payment
RAZORPAY_KEY_ID=your-key
RAZORPAY_KEY_SECRET=your-secret
```

### 4. Deployment Checklist

#### Before Deploying Frontend:
- [ ] Backend API is running and accessible
- [ ] Backend CORS includes your Vercel URL
- [ ] Gemini API key is configured
- [ ] Database is set up with dev-portal tables

#### Vercel Environment Variables (Frontend):
- [ ] `VITE_API_URL=https://your-backend-url.com`

#### Backend (Render/Railway/Your Host):
- [ ] `CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app`
- [ ] `FRONTEND_URL=https://your-frontend.vercel.app`
- [ ] All API keys configured

### 5. Testing the Connection

**Local test**:
```bash
# From frontend-dev-portal
VITE_API_URL=http://localhost:8000 npm run dev

# Visit http://localhost:5174
# Try to log in - should see API calls in Network tab
```

**After deployment**:
1. Go to your Vercel URL
2. Try logging in - check Network tab for 401/403/CORS errors
3. If CORS error appears, add the Vercel URL to `CORS_ALLOWED_ORIGINS` on backend
4. Redeploy backend and test again

### 6. API Response Format Expected

The frontend expects standard API responses:

```json
{
  "status": "success",
  "data": {
    "id": "...",
    "name": "...",
    ...
  }
}
```

Error responses:
```json
{
  "status": "error",
  "detail": "Error message",
  "message": "User-friendly message"
}
```

### 7. Webhook Support (Optional)

When creating a session, optionally provide:
```json
{
  "webhook_url": "https://your-app.com/hooks/sym",
  "set_id": "...",
  "candidate_name": "..."
}
```

Backend will POST analysis results when complete.

---

## Summary: What to Update

1. **Frontend (.env on Vercel)**:
   - Add `VITE_API_URL=YOUR_BACKEND_URL`

2. **Backend (main/settings.py or env)**:
   - Add your frontend URL to `CORS_ALLOWED_ORIGINS`
   - Set `FRONTEND_URL` if not already set

3. **Test**:
   - Visit deployed frontend
   - Attempt login
   - Check Network tab for errors
