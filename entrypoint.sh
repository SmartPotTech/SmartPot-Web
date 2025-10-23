#!/bin/sh
set -e

echo "🧩 Generating runtime environment variables..."
cat <<EOF > /app/dist/env.js
window.__ENV__ = {
  VITE_API_BASE_URL: "${VITE_API_BASE_URL}"
};
EOF

echo "✅ env.js created with:"
cat /app/dist/env.js

echo "🚀 Starting frontend server..."
exec serve -s dist -l 5173
