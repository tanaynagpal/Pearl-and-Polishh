# Pearl & Polishh Atelier | Production Deployment Guide

This guide details the step-by-step procedures for deploying Pearl & Polishh Atelier across Vercel, Render, Cloudinary, and MongoDB Atlas.

---

## 🍃 1. MongoDB Atlas Setup

1. Sign in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new **Database Cluster** (Shared or Serverless).
3. Under **Database Access**, create a user with `readWriteAnyDatabase` privileges.
4. Under **Network Access**, whitelist your server IP address (or `0.0.0.0/0` for cloud deployment platforms like Render or AWS).
5. Copy the connection string into your `MONGODB_URI` environment variable:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/pearl_and_polishh?retryWrites=true&w=majority
   ```

---

## ☁️ 2. Cloudinary Storage Setup

1. Register at [Cloudinary](https://cloudinary.com/).
2. Navigate to your **Dashboard**.
3. Copy your **Cloud Name**, **API Key**, and **API Secret**.
4. Set these in your backend environment variables:
   ```env
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

---

## 🚀 3. Backend Deployment on Render

1. Create a new **Web Service** on [Render](https://render.com/).
2. Connect your GitHub Repository.
3. Configure settings:
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/api/health/liveness`
4. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `3000`
   - `MONGODB_URI`: `<your-mongodb-atlas-uri>`
   - `JWT_SECRET`: `<secure-random-32-char-string>`
   - `JWT_REFRESH_SECRET`: `<secure-random-32-char-string>`
   - `CLOUDINARY_CLOUD_NAME`: `<your-cloudinary-name>`
   - `CLOUDINARY_API_KEY`: `<your-cloudinary-key>`
   - `CLOUDINARY_API_SECRET`: `<your-cloudinary-secret>`
   - `CLIENT_URL`: `https://your-frontend-domain.com`

---

## ⚡ 4. Frontend Deployment on Vercel

1. Import the repository in [Vercel](https://vercel.com/).
2. Select **Vite** framework preset.
3. Set **Build Command**: `npm run build`
4. Set **Output Directory**: `dist`
5. Set Environment Variables:
   - `VITE_GA_MEASUREMENT_ID`: `<optional-ga-id>`
   - `VITE_CLARITY_ID`: `<optional-clarity-id>`
