# Quick Reference: Vercel + Render Setup

## Architecture Diagram

```
YOUR DEPLOYMENT SETUP
══════════════════════════════════════════════════════════════════

Browser                     Vercel                  Render
   │                          │                        │
   │ (1) Visit               │                        │
   ├─ https://your-app ─────→│                        │
   │                    vercel.app                    │
   │                          │                        │
   │                          │ (2) Frontend loads     │
   │                          │ Read VITE_API_URL     │
   │                    https://sym-ecosystem        │
   │                          │ -backend.onrender.com  │
   │                          │                        │
   │ (3) API Call            │                        │
   │ POST /api/v1/          │ (2b) Forward request   │
   │ dev-portal/auth/login/  ├───────────────────────→│
   │                         │                  Check CORS
   │                         │  (3) Response ←───────┤
   │←─────────────────────────┤                        │
   │  Response with token    │                        │
   │                         │                        │
```

## 3 Things to Set Up

### 1️⃣ VERCEL PROJECT
- Import GitHub repo
- Vite auto-detected
- Add env var: `VITE_API_URL`

### 2️⃣ VERCEL ENV VAR
```
Name:  VITE_API_URL
Value: https://sym-ecosystem-backend.onrender.com
```

### 3️⃣ RENDER CORS
In Render backend → Environment:
```
CORS_ALLOWED_ORIGINS=https://your-app.vercel.app,http://127.0.0.1:5174
```

---

## Test It

```javascript
// What happens when you log in:

1. Frontend reads: process.env.VITE_API_URL
   → "https://sym-ecosystem-backend.onrender.com"

2. Makes request to:
   → "https://sym-ecosystem-backend.onrender.com/api/v1/dev-portal/auth/login/"

3. Backend checks CORS:
   → "Is request from https://your-app.vercel.app allowed?" 
   → YES ✓ (you added it to CORS_ALLOWED_ORIGINS)
   → Response sent

4. Frontend receives data ✓
```

---

## The Backend URL

**Production**: `https://sym-ecosystem-backend.onrender.com`
**Local**: `http://127.0.0.1:8000`

→ Same as your main frontend (proven working)

---

## Common Issues + Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| CORS Error | Vercel URL not in Render CORS_ALLOWED_ORIGINS | Add it in Render Environment, redeploy |
| 404 on /api/ | Wrong backend URL in VITE_API_URL | Check it's exactly `https://sym-ecosystem-backend.onrender.com` |
| Cannot reach backend | Render service sleeping | Check Render dashboard, it auto-restarts |
| 401 (login fails) | CORS OK, bad credentials | Check credentials, backend logs |

---

## Where to Check Each

### Vercel
- Deployments → Shows your URL
- Settings → Environment Variables → VITE_API_URL

### Render
- Dashboard → Backend service → Environment → CORS_ALLOWED_ORIGINS
- Dashboard → Deploys → Redeploy button

### Browser DevTools (F12)
- Network tab → filter "login" → see what URL it called
- Console tab → see any error messages

---

## One More Thing

After you redeploy Render backend (when you add CORS):
- Takes 30 seconds - 2 minutes to restart
- You'll see a notification in Render dashboard
- Once "Live" appears, try logging in

---

## Success Criteria

✅ Frontend loads at https://your-app.vercel.app
✅ Can type credentials and click login
✅ Network tab shows login request goes to https://sym-ecosystem-backend.onrender.com
✅ Response is 200 (success) or 401 (wrong password), NOT CORS error
✅ Dashboard appears (if credentials correct)

→ You're done! 🚀
