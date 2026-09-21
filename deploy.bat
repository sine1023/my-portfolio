@echo off
cd /d Y:\my-portfolio

echo ============================
echo   Deploy my-portfolio
echo ============================
echo.

set /p msg="Commit message (press Enter for default): "
if "%msg%"=="" set msg=update

git add .
git commit -m "%msg%"
git push

echo.
echo ============================
echo   Push done. Vercel will redeploy automatically.
echo   https://my-portfolio-sine3.vercel.app
echo ============================
pause
