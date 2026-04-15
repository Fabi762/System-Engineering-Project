#!/bin/bash

# Skript zum Stoppen der laufenden Dienste

echo "Suche nach laufenden Prozessen..."

# Finde uvicorn Prozesse (Backend)
BACKEND_PIDS=$(pgrep -f "uvicorn main:app")

# Finde vite Prozesse (Frontend)
FRONTEND_PIDS=$(pgrep -f "vite")

if [ -n "$BACKEND_PIDS" ]; then
    echo "Stoppe Backend-Prozesse: $BACKEND_PIDS"
    kill $BACKEND_PIDS
else
    echo "Keine Backend-Prozesse gefunden."
fi

if [ -n "$FRONTEND_PIDS" ]; then
    echo "Stoppe Frontend-Prozesse: $FRONTEND_PIDS"
    kill $FRONTEND_PIDS
else
    echo "Keine Frontend-Prozesse gefunden."
fi

echo "Fertig."