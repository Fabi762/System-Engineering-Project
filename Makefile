.PHONY: start stop

start:
	@echo "Starte Backend und Frontend..."
	@cd backend && uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
	@cd my-app && npm run dev -- --host 0.0.0.0 --port 5173 &
	@echo "Beide Dienste gestartet!"
	@echo "Backend: http://localhost:8000"
	@echo "Frontend: http://localhost:5173"

stop:
	@echo "Stoppe alle Dienste..."
	@pkill -f "uvicorn main:app" || true
	@pkill -f "vite" || true
	@echo "Fertig."