# Environment Variable Specification Guide

This document defines all runtime configuration variables required for Pearl & Polishh Atelier across development and production environments.

---

## 🔒 Mandatory Production Variables

| Variable | Description | Example |
| :--- | :--- | :--- |
| `NODE_ENV` | Application environment mode. Must be set to `production` in live environments. | `production` |
| `PORT` | HTTP server binding port. Hardcoded to 3000 in Cloud Run containers. | `3000` |
| `MONGODB_URI` | MongoDB Atlas cluster connection URI. Required for persistent data storage. | `mongodb+srv://user:pass@cluster.mongodb.net/dbname` |
| `JWT_SECRET` | Cryptographic secret for signing HTTP-only access JWT tokens. | `super_secret_jwt_access_key_32chars` |
| `JWT_REFRESH_SECRET` | Cryptographic secret for signing refresh JWT tokens. | `super_secret_jwt_refresh_key_32chars` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account cloud name for product image hosting. | `pearl_polish_cloud` |
| `CLOUDINARY_API_KEY` | Cloudinary REST API Key. | `123456789012345` |
| `CLOUDINARY_API_SECRET` | Cloudinary REST API Secret. | `abc123secretkey` |

---

## ⚙️ Optional Configuration Variables

| Variable | Description | Example |
| :--- | :--- | :--- |
| `CLIENT_URL` | Allowed frontend origin for CORS validation and CSRF checks. | `https://pearlandpolish.com` |
| `APP_URL` | Base application domain for SEO canonicals and email links. | `https://pearlandpolish.com` |
| `GOOGLE_CLIENT_ID` | OAuth Client ID for Google One-Tap authentication. | `12345.apps.googleusercontent.com` |
| `ADMIN_INITIAL_EMAIL` | Admin account email bootstrapped during initial database seed. | `admin@pearlandpolish.com` |
| `ADMIN_INITIAL_PASSWORD` | Admin account password bootstrapped during initial database seed. | `SecurePass123!` |
| `GEMINI_API_KEY` | Google Gemini AI key for custom press-on assistant features. | `AIzaSy...` |
| `VITE_GA_MEASUREMENT_ID` | Optional Google Analytics measurement ID for client telemetry. | `G-XXXXXXXXXX` |
| `VITE_CLARITY_ID` | Optional Microsoft Clarity tracking ID. | `x1y2z3` |
