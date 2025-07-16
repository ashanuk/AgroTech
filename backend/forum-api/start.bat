@echo off
echo Starting AgroTech Forum API...

REM Check if .env file exists
if not exist .env (
    echo Creating .env file from .env.example...
    copy .env.example .env
    echo Please edit .env file with your configuration
)

REM Install dependencies if needed
if not exist node_modules (
    echo Installing dependencies...
    npm install
)

echo Starting server...
npm run dev
