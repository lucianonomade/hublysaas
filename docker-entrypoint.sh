#!/bin/sh

# Replace placeholder with actual environment variables in the built files
echo "Injecting environment variables into built files..."

# Create a config.js file with environment variables
cat > /usr/share/nginx/html/config.js << EOF
window.ENV = {
  VITE_SUPABASE_URL: "${VITE_SUPABASE_URL}",
  VITE_SUPABASE_ANON_KEY: "${VITE_SUPABASE_ANON_KEY}",
  VITE_SERPER_API_KEY: "${VITE_SERPER_API_KEY}",
  VITE_GROQ_API_KEY: "${VITE_GROQ_API_KEY}"
};
EOF

echo "Environment variables injected successfully"

# Start nginx
nginx -g "daemon off;"
