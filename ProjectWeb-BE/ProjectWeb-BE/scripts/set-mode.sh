#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-}"

if [[ "$MODE" != "success" && "$MODE" != "error" ]]; then
  echo "Usage: bash scripts/set-mode.sh <success|error>"
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="$ROOT_DIR/docker-compose.yml"
COMPILER_FILE="$ROOT_DIR/.idea/compiler.xml"
SECURITY_FILE="$ROOT_DIR/eureka-server/src/main/java/vn/tt/practice/eurekaserver/config/SecurityConfig.java"

if [[ ! -f "$COMPOSE_FILE" || ! -f "$COMPILER_FILE" || ! -f "$SECURITY_FILE" ]]; then
  echo "Required files are missing. Run this command from the project repository."
  exit 1
fi

set_success_mode() {
  sed -i 's/enabled="false"/enabled="true"/g' "$COMPILER_FILE"
  if ! grep -q 'requestMatchers("/eureka/**").permitAll()' "$SECURITY_FILE"; then
    sed -i '/\.authorizeHttpRequests(auth -> auth/a\                        .requestMatchers("/eureka/**").permitAll()' "$SECURITY_FILE"
  fi

  sed -i 's|EUREKA_SERVER_URL=http://eureka-server:8761/eureka/|EUREKA_SERVER_URL=http://admin:password@eureka-server:8761/eureka/|g' "$COMPOSE_FILE"
  sed -i 's|KAFKA_BOOTSTRAP_SERVERS=localhost:9092|KAFKA_BOOTSTRAP_SERVERS=kafka-1:9092,kafka-2:9094,kafka-3:9096|g' "$COMPOSE_FILE"

  perl -0777 -i -pe 's|(user-service:.*?SPRING_DATA_REDIS_HOST=)localhost|${1}redis|s' "$COMPOSE_FILE"
  perl -0777 -i -pe 's|(product-service:.*?SPRING_DATA_REDIS_HOST=)localhost|${1}redis|s' "$COMPOSE_FILE"
}

set_error_mode() {
  sed -i 's/enabled="true"/enabled="false"/g' "$COMPILER_FILE"
  sed -i '/requestMatchers("\/eureka\/\*\*").permitAll()/d' "$SECURITY_FILE"

  sed -i 's|EUREKA_SERVER_URL=http://admin:password@eureka-server:8761/eureka/|EUREKA_SERVER_URL=http://eureka-server:8761/eureka/|g' "$COMPOSE_FILE"
  sed -i 's|KAFKA_BOOTSTRAP_SERVERS=kafka-1:9092,kafka-2:9094,kafka-3:9096|KAFKA_BOOTSTRAP_SERVERS=localhost:9092|g' "$COMPOSE_FILE"

  perl -0777 -i -pe 's|(user-service:.*?SPRING_DATA_REDIS_HOST=)redis|${1}localhost|s' "$COMPOSE_FILE"
  perl -0777 -i -pe 's|(product-service:.*?SPRING_DATA_REDIS_HOST=)redis|${1}localhost|s' "$COMPOSE_FILE"
}

if [[ "$MODE" == "success" ]]; then
  echo "Switching to SUCCESS mode (normal behavior)..."
  set_success_mode
else
  echo "Switching to ERROR mode (for report screenshots)..."
  set_error_mode
fi

echo "Rebuilding and restarting containers..."
(
  cd "$ROOT_DIR"
  docker compose up -d --build
)

echo "Done. Current mode: $MODE"
