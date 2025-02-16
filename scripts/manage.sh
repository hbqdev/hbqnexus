#!/bin/bash

APP_PATH=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
SERVICE_NAME="hbqnexus"

function show_usage() {
    echo "Usage: $0 [command]"
    echo "Commands:"
    echo "  start   - Start the service"
    echo "  stop    - Stop the service"
    echo "  restart - Restart the service"
    echo "  status  - Show service status"
    echo "  update  - Pull latest changes and restart"
    echo "  logs    - Show service logs"
}

function update_app() {
    echo "Updating application..."
    cd "$APP_PATH"
    
    # Pull latest changes
    git pull
    
    # Install/update dependencies
    npm install
    
    # Build the application
    npm run build
    
    # Restart service
    sudo systemctl restart $SERVICE_NAME
    
    echo "Update complete!"
}

case "$1" in
    start)
        sudo systemctl start $SERVICE_NAME
        ;;
    stop)
        sudo systemctl stop $SERVICE_NAME
        ;;
    restart)
        sudo systemctl restart $SERVICE_NAME
        ;;
    status)
        systemctl status $SERVICE_NAME
        ;;
    update)
        update_app
        ;;
    logs)
        journalctl -u $SERVICE_NAME -n 50 --no-pager
        ;;
    *)
        show_usage
        exit 1
        ;;
esac

# Show current status after any action
if [ "$1" != "status" ] && [ "$1" != "logs" ]; then
    echo -e "\nCurrent service status:"
    systemctl status $SERVICE_NAME --no-pager
fi 