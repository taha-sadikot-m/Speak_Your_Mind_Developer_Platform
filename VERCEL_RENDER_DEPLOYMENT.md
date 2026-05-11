# Vercel + Render Deployment Checklist

Use this checklist to deploy the Developer Portal to Vercel connected to your Render backend.

## Phase 1: Prepare (Local)

- [ ] Repository created on GitHub with this code
- [ ] You have Vercel account (free tier OK)
- [ ] You have Render account with running backend service
- [ ] Backend URL is: `https://sym-ecosystem-backend.onrender.com`

## Phase 2: Deploy Frontend to Vercel

1. **Login to Vercel**
   - [ ] Go to https://vercel.com/login

2. **Create New Project**
   - [ ] Click "Add New..." → "Project"
   - [ ] Click "Import GitHub Repository"
   - [ ] Find your dev-portal repository
   - [ ] Click "Import"

3. **Configure Build**
   - [ ] Framework: **Vite** (should auto-detect)
   - [ ] Build Command: **`npm run build`**
   - [ ] Output Directory: **`dist`**
   - [ ] Root Directory: **`./`** (or leave blank)

4. **Add Environment Variables** (Critical!)
   - [ ] Click "Environment Variables"
   - [ ] Add new variable:
     - **Name**: `VITE_API_URL`
     - **Value**: `https://sym-ecosystem-backend.onrender.com`
   - [ ] Select scopes: **Production, Preview, Development**

5. **Deploy**
   - [ ] Click "Deploy"
   - [ ] Wait for build to complete
   - [ ] Note your URL: `https://your-app.vercel.app` (or similar)

## Phase 3: Update Render Backend CORS

1. **Go to Render Dashboard**
   - [ ] https://dashboard.render.com

2. **Select Backend Service**
   - [ ] Click on `sym-ecosystem-backend` or your backend name

3. **Update Environment Variable**
   - [ ] Click "Environment"
   - [ ] Find `CORS_ALLOWED_ORIGINS`
   - [ ] Add your Vercel URL:
     ```
     https://your-dev-portal.vercel.app,http://127.0.0.1:5174
     ```
   - [ ] Click "Save"

4. **Redeploy Backend**
   - [ ] Click "Deploys" tab
   - [ ] Click "Manual Deploy"
   - [ ] Wait for backend to restart

## Phase 4: Test Connection

1. **Visit your Vercel frontend**
   - [ ] Go to `https://your-dev-portal.vercel.app`
   - [ ] Should load without errors

2. **Try to Log In**
   - [ ] Enter developer credentials
   - [ ] Click "Sign In"
   - [ ] Open DevTools (F12)

3. **Check Network Tab**
   - [ ] Look for `auth/login/` POST request
   - [ ] Status should be **200** (success) or **401** (invalid credentials)
   - [ ] If **CORS error** → Go back to Phase 3 and update CORS again
   - [ ] If **Network error** → Backend not responding, check Render

4. **Verify Working Features**
   - [ ] Dashboard loads with stats
   - [ ] Can navigate to API Keys page
   - [ ] Can navigate to Sessions page

## Troubleshooting

### ❌ CORS Error
```
Access to XMLHttpRequest at 'https://sym-ecosystem-backend.onrender.com/...' 
from origin 'https://your-dev-portal.vercel.app' has been blocked by CORS policy
```
**Fix:**
1. Update Render `CORS_ALLOWED_ORIGINS` variable (Phase 3, step 3)
2. Redeploy Render backend (Phase 3, step 4)
3. Hard refresh Vercel frontend (Ctrl+Shift+R)

### ❌ 404 Not Found on Login
```
GET /api/v1/dev-portal/auth/login/ 404
```
**Fix:**
1. Check `VITE_API_URL` is exactly: `https://sym-ecosystem-backend.onrender.com`
2. Verify backend service is running on Render
3. Test in browser: https://sym-ecosystem-backend.onrender.com/api/v1/dev-portal/dashboard/ (should show 401 or data, not 404)

### ❌ Cannot Reach Backend (Network Error)
```
Failed to fetch / Connection timeout
```
**Fix:**
1. Backend service might be sleeping (Render free tier)
2. Check Render dashboard → backend status should be "Running"
3. If "Suspended", restart the service or check Render account status

### ❌ Large Bundle Warning
```
JS bundle is larger than 500 KB
```
**Not critical.** Frontend still works. Can optimize later with code-splitting.

## After Deployment

- [ ] Frontend accessible at: `https://your-app.vercel.app`
- [ ] Login works and redirects to dashboard
- [ ] All API calls use correct backend URL
- [ ] CORS is properly configured (no errors in console)

## Rollback

If something breaks:

1. **Frontend Issue**
   - Vercel Deployments page → Click "..." → "Rollback"

2. **Backend Issue**
   - Render Deploys page → Select previous deploy → "Deploy"

3. **Environment Variable Issue**
   - Update Vercel env var
   - Redeploy from Vercel Deployments page (click "Redeploy")

---

## Need Help?

1. Check `BACKEND_SETUP.md` for backend requirements
2. Check `README.md` for troubleshooting section
3. Verify backend running: `https://sym-ecosystem-backend.onrender.com/health/` (or similar status endpoint)
