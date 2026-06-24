# CaptionAI Setup Guide

## Setup Instructions

### 1. Get Your Anthropic API Key
- Go to [console.anthropic.com](https://console.anthropic.com)
- Create an account or log in
- Navigate to API Keys
- Create a new API key and copy it

### 2. Create `.env` File
Create a `.env` file in the project root (copy from `.env.example`):
```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

### 3. Install Dependencies
```bash
pnpm install
```

## Development Mode

Run the dev server with the proxy:
```bash
pnpm dev
```

The Vite dev server will:
- Start on `http://localhost:5173`
- Proxy `/api/anthropic` requests to Anthropic's API
- Use the `ANTHROPIC_API_KEY` from your `.env` file
- **No CORS issues** – requests go through the proxy

## Production Mode

### Build for Production
```bash
pnpm build
```

### Run Production Server
```bash
npm start
```

The Express server will:
- Start on `http://localhost:3000` (or `$PORT`)
- Serve the built React app from `dist/`
- Proxy API requests to Anthropic
- Read API key from `ANTHROPIC_API_KEY` env var

### Deploy to Production
Set the environment variable on your hosting platform:
- **Vercel**: Add to Environment Variables
- **Heroku**: Use `heroku config:set ANTHROPIC_API_KEY=...`
- **Docker**: Pass as env var at runtime
- **Traditional servers**: Export in shell before running

## How It Works

### Development Flow
```
Browser → Vite Dev Server (/api/anthropic) → Anthropic API
```

### Production Flow
```
Browser → Express Server (/api/anthropic) → Anthropic API
```

Both keep your API key **secure on the backend** and avoid CORS issues.

## Troubleshooting

**"Failed to fetch" error:**
- Check that `ANTHROPIC_API_KEY` is set
- Verify the key is valid in the Anthropic console
- Restart your dev/production server after changing .env

**API returns 401:**
- The API key is missing or invalid
- Double-check it's correctly set in `.env` or environment variables

**Port already in use:**
- Change the port: `PORT=3001 npm start`
