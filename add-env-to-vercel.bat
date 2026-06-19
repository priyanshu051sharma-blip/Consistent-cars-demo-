@echo off
echo ====================================
echo Adding Environment Variables to Vercel
echo ====================================
echo.

echo Setting DATABASE_URL...
echo postgres://postgres.fnqimyqjxfjmlslkxheu:gHrprHvxc7flLiOF@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require^&pgbouncer=true | vercel env add DATABASE_URL production

echo Setting NEXT_PUBLIC_RAZORPAY_KEY_ID...
echo rzp_test_SzzWGnDkh15hjC | vercel env add NEXT_PUBLIC_RAZORPAY_KEY_ID production

echo Setting RAZORPAY_KEY_SECRET...
echo ioGdHKX0uacc3nY67t0GnXqs | vercel env add RAZORPAY_KEY_SECRET production

echo Setting NEXT_PUBLIC_APP_URL...
echo https://consistent-cars-main.vercel.app | vercel env add NEXT_PUBLIC_APP_URL production

echo.
echo ====================================
echo Environment Variables Added!
echo Now deploying to production...
echo ====================================
vercel --prod

echo.
echo Done! Check your deployment at:
echo https://consistent-cars-main.vercel.app
echo.
pause
