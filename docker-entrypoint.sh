#!/bin/sh
set -e

cat > /usr/share/nginx/html/env.js <<EOF
window.__env__ = {
  API_URL: '${API_URL:-https://vigilant-mlops.onrender.com}',
};
EOF

exec "$@"