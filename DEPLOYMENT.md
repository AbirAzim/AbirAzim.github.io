# Deployment Guide

## 🚀 Deployment Options

### GitHub Pages & Vercel (Static - Secure)
- **Security**: Chatbot automatically disabled (no API keys exposed)
- **Setup**: 
  - **GitHub Pages**: Push to GitHub, enable Pages in repository settings
  - **Vercel**: Connect GitHub repository to Vercel and deploy
- **URLs**: 
  - GitHub Pages: `https://username.github.io/repository-name`
  - Vercel: `https://abir-azim-github-io.vercel.app`

### Local Development (Full Features)
- **Security**: API keys handled securely via local environment variables
- **Features**: Complete experience with AI chatbot
- **Setup**: Use `.env` file for local development

## 🔑 Environment Variables (Local Development)

Create a `.env` file in the project root:

```
GEMINI_API_KEY=your_gemini_api_key_here
```
**OR**
```
OPENAI_API_KEY=your_openai_api_key_here
```

## 🛡️ Security Features

- ✅ API keys never exposed in client-side code
- ✅ Automatic chatbot disabling on insecure deployments
- ✅ Build-time environment variable injection for Vercel
- ✅ No sensitive data in repository

## 📋 Deployment Checklist

### For Vercel:
- [ ] Repository connected to Vercel
- [ ] **Environment variable** `GEMINI_API_KEY` set in Vercel → Settings → Environment Variables (Production + Preview)
- [ ] Optional: `GEMINI_MODEL` (default `gemini-1.5-flash`)
- [ ] Redeploy after adding secrets; chat uses serverless **`/api/chat`** (key never shipped to the browser)
- [ ] Local API test: `npx vercel dev` (not `python -m http.server`)

### For GitHub Pages:
- [ ] Repository pushed to GitHub
- [ ] Pages enabled in repository settings
- [ ] Verify chatbot is properly hidden (security check)

## 🔧 Local Development

### Static site only (no `/api` routes)
1. `npm run start` → open `http://localhost:5173`
2. Chatbot uses **mock** replies (Python server has no Gemini proxy).

### Full chat with Gemini (local)
1. Copy `.env.example` to `.env` (if you do not have it): `cp .env.example .env`
2. Edit `.env` and set `GEMINI_API_KEY=` to your key (file is gitignored).
3. First time: `npx vercel login` and `npx vercel link` in the project folder (links to your Vercel project).
4. Run **`npm run dev:vercel`** — open the URL it prints (usually `http://localhost:3000`).
5. The app will call `/api/health` and `/api/chat` on that dev server.

## 🌐 Live URLs

- **Vercel**: https://abir-azim-github-io.vercel.app (Full features)
- **GitHub Pages**: https://username.github.io/repo (Static only)