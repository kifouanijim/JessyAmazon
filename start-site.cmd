@echo off
setlocal

echo Lancement de VotreMarche...
echo.
echo Backend: http://localhost:3000
echo Frontend: http://localhost:5500
echo.

start "VotreMarche Backend" cmd /k "cd /d "%~dp0backend" && npm.cmd run dev"
start "VotreMarche Frontend" cmd /k "cd /d "%~dp0" && npx http-server . -p 5500 -c-1"

echo Deux fenetres ont ete ouvertes (backend et frontend).
echo Ferme ces fenetres pour arreter le site.
