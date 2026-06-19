@echo off
echo ====================================
echo Deploying to Vercel with Database
echo ====================================
echo.

echo Step 1: Pushing to Vercel...
vercel --prod

echo.
echo ====================================
echo IMPORTANT: Complete these steps in Vercel Dashboard
echo ====================================
echo.
echo 1. Go to: https://vercel.com/priyanshu051sharma-blips-projects/consistent-cars-main
echo.
echo 2. Click "Storage" tab and create a Postgres database
echo.
echo 3. Go to "Settings" - "Environment Variables" and add:
echo    - DATABASE_URL = (copy from POSTGRES_PRISMA_URL in Storage)
echo    - NEXT_PUBLIC_RAZORPAY_KEY_ID = rzp_test_SzzWGnDkh15hjC
echo    - RAZORPAY_KEY_SECRET = ioGdHKX0uacc3nY67t0GnXqs
echo    - NEXT_PUBLIC_APP_URL = https://consistent-cars-main.vercel.app
echo.
echo 4. After adding env vars, redeploy by running this script again
echo.
echo ====================================
echo.
pause
