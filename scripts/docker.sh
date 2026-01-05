#!/usr/bin/env bash
set -euo pipefail

COMPOSE_FILE="docker-compose.yml"
COMMAND="${1:-help}"
shift || true

usage() {
  cat <<'USAGE'
Uso: ./scripts/docker.sh <comando> [opciones]

Comandos disponibles:
  up [--build]    Levanta los servicios (por defecto ejecuta --build).
  up:detached     Levanta en segundo plano (-d).
  down            Detiene y elimina contenedores, redes y volúmenes anónimos.
  logs            Muestra logs (usa --tail o -f pasando flags extras).
  ps              Lista contenedores en ejecución.

Cualquier parámetro extra se pasa directamente a `docker compose`.
USAGE
}

compose() {
  docker compose -f "$COMPOSE_FILE" "$@"
}

case "$COMMAND" in
  up)
    compose up --build "$@"
    ;;
  up:detached)
    compose up --build -d "$@"
    ;;
  down)
    compose down "$@"
    ;;
  logs)
    compose logs "$@"
    ;;
  ps)
    compose ps "$@"
    ;;
  help|*)
    usage
    ;;
esac
