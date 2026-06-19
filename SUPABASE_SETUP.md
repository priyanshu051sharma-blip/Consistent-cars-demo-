# Supabase Setup for Vercel Deployment

## ✅ You've Created Supabase Database - Great!

Now let's connect it to your Vercel project.

## Step 1: Copy the Database Connection String

From your Supabase dashboard (the screenshot you showed), copy the **POSTGRES_PRISMA_URL** value.

It should look like:
```
postgresql://postgres.[project-ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

## Step 2: Add Environment Variables to Vercel

1. Go to your Vercel project settings:
   https://vercel.com/priyanshu051sharma-blips-projects/consistent-cars-main/settings/environment-variables

2. Click **Add New** and add these variables for **Production, Preview, and Development**:

### Required Variables:

```
DATABASE_URL
Value: [Paste your POSTGRES_PRISMA_URL from Supabase]
Environments: ✓ Production ✓ Preview ✓ Development
```

```
NEXT_PUBLIC_RAZORPAY_KEY_ID
Value: rzp_test_SzzWGnDkh15hjC
Environments: ✓ Production ✓ Preview ✓ Development
```

```
RAZORPAY_KEY_SECRET
Value: ioGdHKX0uacc3nY67t0GnXqs
Environments: ✓ Production ✓ Preview ✓ Development
```

```
NEXT_PUBLIC_APP_URL
Value: https://consistent-cars-main.vercel.app
Environments: ✓ Production ✓ Preview ✓ Development
```

### Optional (if you have them):

```
OPENAI_API_KEY
Value: [Your OpenAI key]
```

```
HUGGINGFACE_API_KEY
Value: [Your Hugging Face key]
```

## Step 3: Run Database Migration & Seed

After adding environment variables, you have two options:

### Option A: Automatic (Recommended)
Just push any change to trigger a new deployment:
```bash
cd consistent-cars-main
git commit --allow-empty -m "Trigger deployment with Supabase"
git push
```

Vercel will automatically:
- Run migrations
- Seed your database with all locations, cars, hotels, pricing
- Build and deploy

### Option B: Manual
If you want to run migrations manually:

1. Install Vercel CLI (already done ✓)
2. Link project: `vercel link`
3. Run migration:
```bash
vercel env pull
npx prisma migrate deploy
npx tsx prisma/seed.ts
```

## Step 4: Verify Deployment

After deployment completes (2-3 minutes), visit:
https://consistent-cars-main.vercel.app

You should now see:
- ✅ All destinations (Delhi, Pune, Goa, Sindhudurg, Mahabaleshwar, Ratnagiri, Aurangabad)
- ✅ All cars (Swift Dzire, Toyota Innova Crysta)
- ✅ All hotels for each location
- ✅ Complete pricing for all services
- ✅ Razorpay payment integration
- ✅ PDF bill generator

## Troubleshooting

### Still seeing empty data?
1. Check build logs: https://vercel.com/priyanshu051sharma-blips-projects/consistent-cars-main/deployments
2. Look for "prisma migrate" and "seed" in the logs
3. If seed failed, the build command might need updating

### Update Build Command:
Go to: Settings → General → Build & Development Settings

Change **Build Command** to:
```
npx prisma generate && npx prisma migrate deploy && npx tsx prisma/seed.ts && next build
```

Then redeploy!

## Quick Check
After deployment, you can check if data was seeded by looking at the Vercel deployment logs. Search for:
- "Start seeding ..."
- "Seeding finished."

If you see these messages, your database is populated! 🎉
