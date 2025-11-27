#!/bin/bash

# Melius Production Docker Helper
# Usage: ./prod.sh [command]

case "$1" in
  up)
    echo "🚀 Starting production environment..."
    docker compose up -d
    echo "✅ Services started!"
    echo "   Backend:  http://localhost:3000"
    echo "   Frontend: http://localhost:3001"
    echo "   pgAdmin:  http://localhost:5050"
    ;;
  build)
    echo "🔨 Building and starting production environment..."
    docker compose up --build -d
    echo "✅ Services built and started!"
    ;;
  down)
    echo "🛑 Stopping production environment..."
    docker compose down
    echo "✅ Services stopped"
    ;;
  logs)
    if [ -z "$2" ]; then
      docker compose logs -f
    else
      docker compose logs -f "$2"
    fi
    ;;
  restart)
    echo "♻️  Restarting production environment..."
    docker compose restart
    echo "✅ Services restarted"
    ;;
  ps)
    docker compose ps
    ;;
  *)
    echo "Melius Production Helper"
    echo ""
    echo "Usage: ./prod.sh [command]"
    echo ""
    echo "Commands:"
    echo "  up        Start production environment"
    echo "  build     Build and start production environment"
    echo "  down      Stop production environment"
    echo "  logs      View logs (add service name: logs backend)"
    echo "  restart   Restart all services"
    echo "  ps        Show running services"
    echo ""
    echo "Examples:"
    echo "  ./prod.sh build"
    echo "  ./prod.sh logs backend"
    echo "  ./prod.sh down"
    ;;
esac
