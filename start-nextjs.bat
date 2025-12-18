@echo off
cd /d "d:\Saas\imob\nextjs"
set NEXT_PUBLIC_DIRECTUS_URL=http://localhost:8055
set DIRECTUS_URL=http://localhost:8055
echo.
echo ========================================
echo     INICIANDO SERVIDOR NEXT.JS
echo ========================================
echo.
echo URL: http://localhost:4000
echo Login: admin@example.com / d1r3ctu5
echo.
echo Pressione Ctrl+C para parar
echo ========================================
echo.
pnpm dev
