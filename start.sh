#!/bin/bash

# Skript zum Starten von Backend und Frontend gleichzeitig

echo "Starte Backend..."
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

echo "Starte Frontend..."
cd ../my-app
npm run dev -- --host 0.0.0.0 --port 5173 &
FRONTEND_PID=$!

echo "Beide Dienste gestartet!"
echo "Backend läuft auf http://localhost:8000 (PID: $BACKEND_PID)"
echo "Frontend läuft auf http://localhost:5173 (PID: $FRONTEND_PID)"
echo ""
echo "Drücke Ctrl+C, um beide zu stoppen."

# Warte auf Interrupt-Signal
trap "echo 'Stoppe Dienste...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT

# Halte das Skript am Laufen
wait