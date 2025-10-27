@echo off
echo Iniciando SysGestor...
cd /d "%~dp0"

echo Iniciando servidor backend...
start "SysGestor Backend" cmd /k node backend\server.js

timeout /t 3 /nobreak > nul

echo Abriendo interfaz de SysGestor...
start http://localhost:3000/frontend/index.html

echo SysGestor se está iniciando. Por favor espere...
timeout /t 5 /nobreak > nul
exit