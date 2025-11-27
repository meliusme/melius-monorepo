#!/bin/bash

# Melius Development Docker Helper
# Usage: ./dev.sh [command]

COMPOSE_FILE="docker-compose.dev.yml"

case "$1" in
  up)
    echo "🚀 Starting development environment..."
    docker compose -f $COMPOSE_FILE up -d
    echo "✅ Services started!"
    echo "   Backend:  http://localhost:3000"
    echo "   Frontend: http://localhost:3001"
    echo "   pgAdmin:  http://localhost:5050"
    ;;
  down)
    echo "🛑 Stopping development environment..."
    docker compose -f $COMPOSE_FILE down
    echo "✅ Services stopped"
    ;;
  logs)
    if [ -z "$2" ]; then
      docker compose -f $COMPOSE_FILE logs -f
    else
      docker compose -f $COMPOSE_FILE logs -f "$2"
    fi
    ;;
  restart)
    echo "♻️  Restarting development environment..."
    docker compose -f $COMPOSE_FILE restart
    echo "✅ Services restarted"
    ;;
  ps)
    docker compose -f $COMPOSE_FILE ps
    ;;
  *)
    echo "Melius Development Helper"
    echo ""
    echo "Usage: ./dev.sh [command]"
    echo ""
    echo "Commands:"
    echo "  up        Start development environment (with hot reload)"
    echo "  down      Stop development environment"
    echo "  logs      View logs (add service name: logs backend)"
    echo "  restart   Restart all services"
    echo "  ps        Show running services"
    echo ""
    echo "Examples:"
    echo "  ./dev.sh up"
    echo "  ./dev.sh logs backend"
    echo "  ./dev.sh down"
    ;;
esac
