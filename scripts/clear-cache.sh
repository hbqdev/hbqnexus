#!/bin/bash

# Script to update cache control headers for SVG files
# This should be run on your server after deploying new SVG icons

echo "Setting cache control headers for SVG files..."

# If using Apache, create or update .htaccess file
if [ -f "/path/to/your/web/root/.htaccess" ]; then
  # Backup existing .htaccess
  cp /path/to/your/web/root/.htaccess /path/to/your/web/root/.htaccess.bak
  
  # Add or update cache control headers
  cat << EOF >> /path/to/your/web/root/.htaccess
  
# Force revalidation of SVG files
<FilesMatch "\.(svg)$">
  Header set Cache-Control "no-cache, must-revalidate"
  Header set Pragma "no-cache"
  Header set Expires "0"
</FilesMatch>
EOF

  echo "Updated .htaccess file with cache control headers"
fi

# If using Nginx, you would need to update your server configuration
# This is just a reminder - you'll need to manually update your Nginx config
echo "If using Nginx, remember to update your server configuration with:"
echo "location ~* \.svg$ {"
echo "  add_header Cache-Control 'no-store, no-cache, must-revalidate, proxy-revalidate';"
echo "  add_header Pragma 'no-cache';"
echo "  add_header Expires '0';"
echo "  expires off;"
echo "}"

echo "Done! Remember to restart your web server if necessary." 