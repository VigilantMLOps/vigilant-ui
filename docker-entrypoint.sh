#!/bin/sh
set -e

cat > /usr/share/nginx/html/env.js <<EOF
window.__env__ = {
  API_URL: '${API_URL:-https://vigilant-api.duckdns.org}',
};
EOF

exec "$@"