#!/bin/sh
set -e

echo "🧩 Starting runtime variable injection..."

ASSETS_DIR="/app/dist/assets"
ENVMAP_FILE="/app/dist/runtime.envmap"

if [ ! -f "$ENVMAP_FILE" ]; then
  echo "❌ No runtime.envmap file found at $ENVMAP_FILE"
  exit 1
fi

# Buscar archivos JS (con hash) en el build
TARGET_FILES=$(find "$ASSETS_DIR" -type f -name "*.js")
if [ -z "$TARGET_FILES" ]; then
  echo "❌ No JavaScript files found in $ASSETS_DIR"
  exit 1
fi

# Leer archivo de mapeo
while IFS='=' read -r ENV_NAME PLACEHOLDER DEFAULT_VALUE; do
  # Saltar líneas vacías o comentarios
  [ -z "$ENV_NAME" ] && continue
  echo "$ENV_NAME" | grep -q '^#' && continue

  # Obtener valor desde el entorno o usar default
  VALUE=$(printenv "$ENV_NAME")
  [ -z "$VALUE" ] && VALUE="$DEFAULT_VALUE"

  echo "🔧 Injecting $ENV_NAME=$VALUE"

  # Escapar caracteres peligrosos para sed
  SAFE_VALUE=$(printf '%s\n' "$VALUE" | sed 's/[&/\]/\\&/g')

  # Reemplazar el placeholder en todos los archivos .js
  for FILE in $TARGET_FILES; do
    if grep -q "$PLACEHOLDER" "$FILE"; then
      sed -i "s|$PLACEHOLDER|$SAFE_VALUE|g" "$FILE"
      echo "✅ Replaced $PLACEHOLDER in $(basename "$FILE")"
    fi
  done

done < "$ENVMAP_FILE"

echo "🚀 Starting frontend server..."
exec serve -s dist -l 5173
