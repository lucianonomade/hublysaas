#!/bin/sh
set -e

echo "=== Hubly Docker Entrypoint ==="
echo "Starting at: $(date)"

# Create env-config.js with actual environment variables
echo "Creating env-config.js..."
cat > /usr/share/nginx/html/env-config.js << 'EOF'
window.ENV = {
  VITE_SUPABASE_URL: "${VITE_SUPABASE_URL}",
  VITE_SUPABASE_ANON_KEY: "${VITE_SUPABASE_ANON_KEY}",
  VITE_SERPER_API_KEY: "${VITE_SERPER_API_KEY}",
  VITE_GROQ_API_KEY: "${VITE_GROQ_API_KEY}"
};
console.log('[ENV] Runtime environment variables loaded');
EOF

# Replace placeholders with actual values
sed -i "s|\${VITE_SUPABASE_URL}|${VITE_SUPABASE_URL}|g" /usr/share/nginx/html/env-config.js
sed -i "s|\${VITE_SUPABASE_ANON_KEY}|${VITE_SUPABASE_ANON_KEY}|g" /usr/share/nginx/html/env-config.js
sed -i "s|\${VITE_SERPER_API_KEY}|${VITE_SERPER_API_KEY}|g" /usr/share/nginx/html/env-config.js
sed -i "s|\${VITE_GROQ_API_KEY}|${VITE_GROQ_API_KEY}|g" /usr/share/nginx/html/env-config.js

echo "env-config.js created successfully"

# List files to verify
echo "Files in /usr/share/nginx/html:"
ls -la /usr/share/nginx/html/

echo "Files in /usr/share/nginx/html/assets:"
ls -la /usr/share/nginx/html/assets/ || echo "No assets directory!"

# Start nginx
echo "Starting nginx..."
exec nginx -g "daemon off;"
