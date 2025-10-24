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

echo ""
echo "📂 Listing .js files in $ASSETS_DIR ..."
JS_FILES=$(find "$ASSETS_DIR" -type f -name "*.js")
echo "$JS_FILES" | sed 's/^/   • /'
echo ""

CHANGED_FILES=()

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
  while IFS= read -r jsfile; do
    if grep -q "$PLACEHOLDER" "$jsfile"; then
      sed -i "s#${PLACEHOLDER}#${VALUE}#g" "$jsfile"
      echo "   ✅ Modified: $jsfile"
      CHANGED_FILES+=("$jsfile")
    fi
  done <<< "$JS_FILES"

done < "$ENVMAP_FILE"

echo ""
echo "✅ Environment variable replacement completed."

if [ ${#CHANGED_FILES[@]} -gt 0 ]; then
  echo ""
  echo "📝 Files modified:"
  printf '   • %s\n' "${CHANGED_FILES[@]}"
else
  echo "ℹ️  No JavaScript files required replacement."
fi

echo ""
# Ejecutar el comando principal del contenedor
exec "$@"