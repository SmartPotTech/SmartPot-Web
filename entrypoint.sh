#!/bin/bash
set -e

DIST_DIR="/app/dist"
ASSETS_DIR="$DIST_DIR/assets"
ENVMAP_FILE="$DIST_DIR/runtime.envmap"

echo "🚀 Starting runtime variable replacement..."

if [ ! -f "$ENVMAP_FILE" ]; then
  echo "❌ Envmap file not found at $ENVMAP_FILE"
  exit 1
fi

if [ ! -d "$ASSETS_DIR" ]; then
  echo "❌ Assets directory not found at $ASSETS_DIR"
  exit 1
fi

# Leer todas las líneas válidas del envmap
while IFS= read -r line; do
  # Saltar comentarios o líneas vacías
  [[ -z "$line" || "$line" =~ ^# ]] && continue

  # Extraer campos: NOMBRE_ENV=PLACEHOLDER|DEFAULT
  ENV_NAME=$(echo "$line" | cut -d= -f1)
  REST=$(echo "$line" | cut -d= -f2-)
  PLACEHOLDER=$(echo "$REST" | cut -d'|' -f1)
  DEFAULT_VALUE=$(echo "$REST" | cut -d'|' -f2-)

  # Obtener valor del entorno o usar default
  VALUE=${!ENV_NAME:-$DEFAULT_VALUE}

  echo "🌍 Replacing $PLACEHOLDER -> $VALUE"

  # Reemplazar en todos los archivos .js del build
  find "$ASSETS_DIR" -type f -name "*.js" | while read -r jsfile; do
    sed -i "s#${PLACEHOLDER}#${VALUE}#g" "$jsfile"
  done

done < "$ENVMAP_FILE"

echo "✅ Environment variable replacement completed."

# Ejecutar el comando principal del contenedor
exec "$@"