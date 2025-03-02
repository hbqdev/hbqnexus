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
        "🔄 Update icons and rebuild"
        "🧹 Clear browser caches"
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
                echo "Performing clean restart..."
                cd "$APP_PATH"
                
                # Stop the service
                sudo systemctl stop $SERVICE_NAME
                
                # Remove dist directory
                echo "Cleaning build directory..."
                rm -rf dist
                
                # Rebuild
                echo "Rebuilding application..."
                npm run build
                
                # Start service
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
            "🔄 Update icons and rebuild")
                update_icons
                break
                ;;
            "🧹 Clear browser caches")
                clear_caches
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
    show_status
}

function update_icons() {
    echo "Updating icon cache-busting parameters..."
    cd "$APP_PATH"
    
    # Stop the service
    sudo systemctl stop $SERVICE_NAME
    
    # Update icon URLs with cache-busting parameters
    npm run update-icons
    
    # Remove dist directory
    echo "Cleaning build directory..."
    rm -rf dist
    
    # Rebuild
    echo "Rebuilding application with updated icons..."
    npm run build
    
    # Start service
    sudo systemctl restart $SERVICE_NAME
    
    echo "Icon update complete!"
    show_status
}

function clear_caches() {
    echo "Clearing browser caches for SVG files..."
    cd "$APP_PATH"
    
    # Customize the clear-cache.sh script path if needed
    CACHE_SCRIPT="$APP_PATH/scripts/clear-cache.sh"
    
    # Check if the script exists and is executable
    if [ -f "$CACHE_SCRIPT" ] && [ -x "$CACHE_SCRIPT" ]; then
        # Run the cache clearing script
        $CACHE_SCRIPT
    else
        echo "Cache clearing script not found or not executable."
        echo "Please check $CACHE_SCRIPT"
    fi
    
    echo "If you're using a CDN like Cloudflare, remember to purge the cache there as well."
    echo "Cache clearing complete!"
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