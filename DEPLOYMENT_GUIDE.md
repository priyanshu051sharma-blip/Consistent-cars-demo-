# Deployment Guide - Vercel Setup

## Issue
Your localhost has all the data (destinations, cars, pricing, hotels) but Vercel doesn't because the SQLite database isn't deployed.

## Solution: Set Up Vercel Postgres

### Step 1: Add Vercel Postgres to Your Project

1. Go to your Vercel project dashboard:
   https://vercel.com/priyanshu051sharma-blips-projects/consistent-cars-main

2. Click on the **Storage** tab

3. Click **Create Database** → Select **Postgres**

4. Create a new Postgres database (it's free for hobby projects)

5. Vercel will automatically add these environment variables:
   - `POSTGRES_URL`
   - `POSTGRES_PRISMA_URL` ← Use this one for DATABASE_URL
   - `POSTGRES_URL_NON_POOLING`

### Step 2: Configure Environment Variables

Go to: https://vercel.com/priyanshu051sharma-blips-projects/consistent-cars-main/settings/environment-variables

Add these variables:

```
DATABASE_URL = (use the POSTGRES_PRISMA_URL value from Storage tab)
NEXT_PUBLIC_RAZORPAY_KEY_ID = <set live key in Vercel>
RAZORPAY_KEY_SECRET = <set securely in Vercel>
NEXT_PUBLIC_APP_URL = https://consistent-cars-main.vercel.app
```

**Important:** If you need OpenAI chatbot or Hugging Face features, also add:
```
OPENAI_API_KEY = your_openai_key
HUGGINGFACE_API_KEY = your_huggingface_key
```

### Step 3: Update Build Command in Vercel

1. Go to: https://vercel.com/priyanshu051sharma-blips-projects/consistent-cars-main/settings

2. Go to **General** → **Build & Development Settings**

3. Update **Build Command** to:
   ```
   npx prisma generate && npx prisma migrate deploy && npx prisma db seed && next build
   ```

This will:
- Generate Prisma client
- Run database migrations
- Seed your database with all locations, cars, hotels, and pricing
- Build your Next.js app

### Step 4: Redeploy

After setting everything up, redeploy:

```bash
cd consistent-cars-main
vercel --prod
```

Or simply push to your GitHub repo and Vercel will auto-deploy.

### Step 5: Verify

Visit https://consistent-cars-main.vercel.app and you should see:
- ✅ All destinations (Delhi, Pune, Goa, Sindhudurg, etc.)
- ✅ All cars with pricing
- ✅ Hotels for each location
- ✅ Razorpay payment integration
- ✅ PDF bill generator

## Alternative: Quick Manual Seed

If the automatic seeding doesn't work, you can manually seed after deployment:

1. Install Vercel CLI: `npm install -g vercel`
2. Link to your project: `vercel link`
3. Run seed command: `vercel env pull .env.production`
4. Then: `npx prisma db seed`

## Troubleshooting

### Images Not Loading
If images don't show, make sure all image paths in your seed file match the actual files in `/public/image/`

### Database Connection Issues
- Verify `DATABASE_URL` is set correctly in Vercel environment variables
- Use `POSTGRES_PRISMA_URL` (not `POSTGRES_URL`) for better connection pooling

### Seed Not Running
- Check build logs in Vercel dashboard
- The seed command might fail if it's the first time - just redeploy once more
