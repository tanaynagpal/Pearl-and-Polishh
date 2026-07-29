# Pearl & Polishh Atelier | Production Architecture

A luxury press-on nail e-commerce store and salon studio management application engineered for high availability, security, and performance.

---

## 🌟 Key Architectural Features

- **Full-Stack Node.js & Express API**: Bundled with `esbuild` for zero-dependency runtime execution.
- **Client Application**: React 19 SPA built with Vite, Tailwind CSS v4, and Lucide Icons.
- **Database Engine**: Hybrid database architecture supporting MongoDB Atlas in production with automatic fallback to an isolated JSON file store in local development.
- **Security & Hardening**:
  - Helmet CSP, HSTS, X-Content-Type-Options, Referrer-Policy, Frameguard.
  - Rate limiting on authentication (`/api/auth`) and general API endpoints (`/api`).
  - Input sanitization (XSS and MongoDB NoSQL injection prevention).
  - CSRF protection with HTTP-only credentials.
- **Cloudinary Image Upload Security**:
  - Buffer signature / magic bytes validation (JPEG, PNG, WebP, AVIF).
  - EXIF metadata stripping and automated compression.
  - Randomized unique public IDs (prevents duplicate file overwrites).
  - Responsive image transformations (`w_300`, `w_600`, `w_1200`, auto-WebP/AVIF).
- **Monitoring & Observability**:
  - Health checks (`/api/health`), Liveness probes (`/api/health/liveness`), and Readiness probes (`/api/health/readiness`).
  - Structured process metrics (`/api/health/metrics`).
  - Unhandled rejection & uncaught exception handling with graceful shutdown signals (`SIGTERM`, `SIGINT`).
- **SEO & Accessibility**:
  - Structured Data (JSON-LD) for Local Business / Nail Salon schema.
  - Complete OpenGraph and Twitter Card metadata.
  - Dynamic `sitemap.xml`, `robots.txt`, and `site.webmanifest`.
  - Offline fallback status detection and Error Boundary integration.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and configure your credentials:
```bash
cp .env.example .env
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 🐳 Docker Containerization

To build and launch the production container:
```bash
docker build -t pearl-and-polish-app .
docker run -p 3000:3000 --env-file .env pearl-and-polish-app
```
