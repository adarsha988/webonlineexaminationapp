# Single Port Configuration Guide

## Overview

This application is configured to run on **a single port (5000)** in development mode. Both the client (React/Vite) and the server (Express) run together on the same port using Vite's middleware mode.

## How It Works

### Development Mode
- **Port 5000**: Serves both the API and the client application
- Express runs the backend API at `/api/*` routes
- Vite middleware serves the React client for all other routes
- Hot Module Replacement (HMR) works seamlessly

### Architecture
```
Browser (http://localhost:5000)
        ↓
Express Server (Port 5000)
        ├── /api/* → API Routes (Express)
        └── /* → Client App (Vite Middleware)
```

## How to Run

### ✅ CORRECT Way (Single Port)

Run this command from the **root directory**:

```bash
npm run dev
```

This will:
1. Start the Express server on port 5000
2. Automatically integrate Vite as middleware
3. Serve both API and client on http://localhost:5000
4. Enable hot reload for React components

### ❌ INCORRECT Way (Multiple Ports)

**DO NOT** run these commands:

```bash
# Don't run this from the root directory with Vite separately
npm run dev & cd client && npm run dev

# Don't run this from the client directory
cd client
npm run dev
```

These will start a standalone Vite server on port 5173, causing confusion and potential CORS issues.

## Verifying Your Setup

1. **Check your terminal** - You should see only ONE server starting:
   ```
   [express] serving on port 5000
   ```

2. **Open your browser** - Go to http://localhost:5000 (NOT 5173)

3. **Check the network tab** - All API requests should go to the same origin

## Environment Configuration

Make sure your `.env` file has:

```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5000
ALLOWED_ORIGINS=http://localhost:5000
```

## Benefits of Single Port Setup

✅ **No CORS issues** - Same origin for client and API  
✅ **Simpler deployment** - One server to manage  
✅ **Better performance** - No proxy overhead in production  
✅ **Easier debugging** - Single port to monitor  
✅ **Production-like setup** - Matches production architecture  

## Production Mode

In production, the same single port setup applies:

```bash
npm run build
npm start
```

The built client files are served as static assets from the Express server on the same port as the API.

## Troubleshooting

### Problem: "Cannot connect to server"
- Make sure you're accessing http://localhost:5000, not 5173
- Check if another process is using port 5000
- Verify your `.env` file has the correct PORT setting

### Problem: "API calls failing"
- Check that your `.env` has CLIENT_URL=http://localhost:5000
- Verify ALLOWED_ORIGINS includes http://localhost:5000
- Make sure you're not running the client separately

### Problem: "Port already in use"
- Stop any existing dev servers
- Kill process on port 5000: `npx kill-port 5000`
- Run `npm run dev` again

## Client Package.json Scripts

The `client/package.json` still has dev scripts, but these are **NOT** meant to be used for normal development. They are only for:
- Building the client standalone: `npm run build` (from client directory)
- Running linters: `npm run lint` (from client directory)

**Always use `npm run dev` from the root directory for development.**
