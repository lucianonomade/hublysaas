#!/bin/sh

echo "Starting Hubly application..."
echo "Injecting environment variables..."

# Create env-config.js with actual environment variables
cat > /usr/share/nginx/html/env-config.js << EOF
window.ENV = {
  VITE_SUPABASE_URL: "${VITE_SUPABASE_URL}",
  VITE_SUPABASE_ANON_KEY: "${VITE_SUPABASE_ANON_KEY}",
  VITE_SERPER_API_KEY: "${VITE_SERPER_API_KEY}",
  VITE_GROQ_API_KEY: "${VITE_GROQ_API_KEY}"
};
console.log('[ENV] Runtime environment variables loaded:', {
  hasSupabaseUrl: !!window.ENV.VITE_SUPABASE_URL,
  hasSupabaseKey: !!window.ENV.VITE_SUPABASE_ANON_KEY,
  supabaseUrl: window.ENV.VITE_SUPABASE_URL
});
EOF

echo "Environment variables injected to /usr/share/nginx/html/env-config.js"
cat /usr/share/nginx/html/env-config.js

# Start nginx
echo "Starting nginx..."
exec nginx -g "daemon off;"
