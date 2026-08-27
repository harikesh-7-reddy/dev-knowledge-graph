# Deployment

## Backend — Render
1. Push this repository to GitHub.
2. In Render, create a Web Service from the repo.
3. Root Directory: `server`.
4. Build Command: `npm install && npm run build`.
5. Start Command: `npm start`.
6. Health Check Path: `/api/health`.
7. Set `COGNODB_URI`, `COGNODB_USERNAME`, `COGNODB_PASSWORD`, `NODE_ENV=production`, and `CORS_ORIGIN` (your Vercel URL).

## Frontend — Vercel
1. Import the GitHub repo into Vercel.
2. Root Directory: `web`.
3. Framework: Vite.
4. Build Command: `npm run build`.
5. Output Directory: `dist`.
6. Set `VITE_API_URL` to `https://<your-render-service>.onrender.com/api`.
7. `web/vercel.json` supplies the SPA fallback for React Router.

## Post-deploy checks
- Open `https://<render-service>.onrender.com/api/health` and confirm `status: ok`.
- Open the Vercel URL and verify Dashboard, Developers, Technologies, Projects, and Graph Explorer.
- Update `README.md` with the real demo and video URLs.
