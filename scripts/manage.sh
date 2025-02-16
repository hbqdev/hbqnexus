#!/bin/bash

APP_PATH=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
SERVICE_NAME="hbqnexus"

function show_usage() {
    echo -e "\n=== HBQ Nexus Service Manager ==="
    PS3=$'\nSelect an option: '
    options=(
        "🟢 Start service"
        "🔴 Stop service"
        "🔄 Restart service"
        "ℹ️  Show status"
        "⬆️  Update and restart"
        "📋 Show logs"
        "👋 Exit"
    )
    select opt in "${options[@]}"
    do
        case $opt in
            "🟢 Start service")
                sudo systemctl start $SERVICE_NAME
                show_status
                break
                ;;
            "🔴 Stop service")
                sudo systemctl stop $SERVICE_NAME
                show_status
                break
                ;;
            "🔄 Restart service")
                sudo systemctl restart $SERVICE_NAME
                show_status
                break
                ;;
            "ℹ️  Show status")
                show_status
                break
                ;;
            "⬆️  Update and restart")
                update_app
                break
                ;;
            "📋 Show logs")
                show_logs
                break
                ;;
            "👋 Exit")
                echo -e "\nGoodbye! 👋"
                exit 0
                ;;
            *) 
                echo "Invalid option"
                ;;
        esac
    done
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

function show_status() {
    systemctl status $SERVICE_NAME --no-pager
}

function show_logs() {
    journalctl -u $SERVICE_NAME -n 50 --no-pager
}

# Main loop
while true; do
    clear
    show_usage
    echo -e "\nPress Enter to continue..."
    read
done 