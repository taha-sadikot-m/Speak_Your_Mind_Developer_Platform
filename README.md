# SYM Developer Portal (Standalone)

This is the standalone frontend for the SYM Developer Portal, prepared for deployment as a separate repository on Vercel.

## Tech Stack

- Vite
- React + TypeScript
- Tailwind CSS

## Local Development

1. Install dependencies:
   npm install
2. Create env file:
   copy .env.example .env.local
3. Start dev server:
   npm run dev

## Environment Variables

- VITE_API_URL: Backend API base URL

Local example:
VITE_API_URL=http://127.0.0.1:8000

Production example:
VITE_API_URL=https://api.speakyourmind.app

## Build

npm run build

## Vercel Deployment

This project includes vercel.json with:
- Vite build output directory (dist)
- SPA rewrite rule to index.html for React Router routes
- Long-term caching for /assets

In Vercel project settings:
1. Set framework preset to Vite (or let auto-detect).
2. Add environment variable VITE_API_URL.
3. Redeploy.

## Push This Folder To A Separate Repository

From the frontend-dev-portal directory:

1. git init
2. git add .
3. git commit -m "Initial developer portal"
4. git branch -M main
5. git remote add origin <your-new-repo-url>
6. git push -u origin main
