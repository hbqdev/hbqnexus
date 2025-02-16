#!/bin/bash

# Get the absolute path to the application
APP_PATH=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
SERVICE_NAME="hbqnexus"
USER=$USER

# Create systemd service file
cat > /tmp/$SERVICE_NAME.service << EOF
[Unit]
Description=HBQ Nexus - Personal Services Hub
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$APP_PATH
ExecStart=/usr/bin/npm run preview
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

# Install the service
echo "Installing service..."
sudo mv /tmp/$SERVICE_NAME.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable $SERVICE_NAME

echo "Service installed successfully!"
echo "Use 'sudo systemctl start $SERVICE_NAME' to start the service" 