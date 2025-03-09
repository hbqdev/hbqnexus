#!/bin/bash
APP_PATH=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
SERVICE_NAME="hbqnexus"
API_SERVICE_NAME="hbqnexus-api"  # New service name for the API server

function show_usage() {
    echo -e "\n=== HBQ Nexus Service Manager ==="
    PS3=$'\nSelect an option: '
    options=(
        "🟢 Start all services"
        "🔴 Stop all services"
        "🔄 Restart all services"
        "ℹ️  Show status"
        "⬆️  Update and restart"
        "🔄 Update icons and rebuild"
        "🧹 Clear browser caches"
        "📋 Show logs"
        "🔌 Manage API server only"
        "👋 Exit"
    )
    select opt in "${options[@]}"
    do
        case $opt in
            "🟢 Start all services")
                sudo systemctl start $SERVICE_NAME
                sudo systemctl start $API_SERVICE_NAME
                show_status
                break
                ;;
            "🔴 Stop all services")
                sudo systemctl stop $SERVICE_NAME
                sudo systemctl stop $API_SERVICE_NAME
                show_status
                break
                ;;
            "🔄 Restart all services")
                echo "Performing clean restart..."
                cd "$APP_PATH"
                
                # Stop the services
                sudo systemctl stop $SERVICE_NAME
                sudo systemctl stop $API_SERVICE_NAME
                
                # Remove dist directory
                echo "Cleaning build directory..."
                rm -rf dist
                
                # Rebuild
                echo "Rebuilding application..."
                npm run build
                
                # Start services
                sudo systemctl restart $SERVICE_NAME
                sudo systemctl restart $API_SERVICE_NAME
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
            "🔌 Manage API server only")
                manage_api_server
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

function manage_api_server() {
    echo -e "\n=== API Server Management ==="
    PS3=$'\nSelect an option: '
    options=(
        "🟢 Start API server"
        "🔴 Stop API server"
        "🔄 Restart API server"
        "ℹ️  Show API server status"
        "📋 Show API server logs"
        "🔙 Back to main menu"
    )
    select opt in "${options[@]}"
    do
        case $opt in
            "🟢 Start API server")
                sudo systemctl start $API_SERVICE_NAME
                systemctl status $API_SERVICE_NAME --no-pager
                break
                ;;
            "🔴 Stop API server")
                sudo systemctl stop $API_SERVICE_NAME
                systemctl status $API_SERVICE_NAME --no-pager
                break
                ;;
            "🔄 Restart API server")
                sudo systemctl restart $API_SERVICE_NAME
                systemctl status $API_SERVICE_NAME --no-pager
                break
                ;;
            "ℹ️  Show API server status")
                systemctl status $API_SERVICE_NAME --no-pager
                break
                ;;
            "📋 Show API server logs")
                journalctl -u $API_SERVICE_NAME -n 50 --no-pager
                break
                ;;
            "🔙 Back to main menu")
                break
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
    
    # Check if couchbase package is installed
    if ! npm list couchbase | grep -q "couchbase"; then
        echo "Installing Couchbase SDK..."
        npm install couchbase
    fi
    
    # Check if dotenv package is installed
    if ! npm list dotenv | grep -q "dotenv"; then
        echo "Installing dotenv..."
        npm install dotenv
    fi
    
    # Build the application
    npm run build
    
    # Create API server service if it doesn't exist
    check_and_create_api_service
    
    # Restart services
    sudo systemctl restart $SERVICE_NAME
    sudo systemctl restart $API_SERVICE_NAME
    
    echo "Update complete!"
    show_status
}

function check_and_create_api_service() {
    if ! systemctl list-unit-files | grep -q "$API_SERVICE_NAME"; then
        echo "Creating API server service..."
        
        # Create service file
        cat > /tmp/$API_SERVICE_NAME.service << EOF
[Unit]
Description=HBQ Nexus API Server
After=network.target

[Service]
Type=simple
User=$(whoami)
WorkingDirectory=$APP_PATH
ExecStart=/usr/bin/node $APP_PATH/server/index.js
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF
        
        # Move service file to systemd directory
        sudo mv /tmp/$API_SERVICE_NAME.service /etc/systemd/system/
        
        # Reload systemd
        sudo systemctl daemon-reload
        
        # Enable service
        sudo systemctl enable $API_SERVICE_NAME
        
        echo "API server service created and enabled."
    fi
}

function update_icons() {
    echo "Updating icon cache-busting parameters..."
    cd "$APP_PATH"
    
    # Stop the services
    sudo systemctl stop $SERVICE_NAME
    sudo systemctl stop $API_SERVICE_NAME
    
    # Update icon URLs with cache-busting parameters
    npm run update-icons
    
    # Remove dist directory
    echo "Cleaning build directory..."
    rm -rf dist
    
    # Rebuild
    echo "Rebuilding application with updated icons..."
    npm run build
    
    # Start services
    sudo systemctl restart $SERVICE_NAME
    sudo systemctl restart $API_SERVICE_NAME
    
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
    echo -e "\n=== Main Web Service Status ==="
    systemctl status $SERVICE_NAME --no-pager
    
    echo -e "\n=== API Server Status ==="
    systemctl status $API_SERVICE_NAME --no-pager
}

function show_logs() {
    echo -e "\n=== Main Web Service Logs ==="
    journalctl -u $SERVICE_NAME -n 25 --no-pager
    
    echo -e "\n=== API Server Logs ==="
    journalctl -u $API_SERVICE_NAME -n 25 --no-pager
}

# Check for required packages on first run
function check_dependencies() {
    echo "Checking for required dependencies..."
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js is not installed. Please install Node.js before continuing."
        exit 1
    fi
    
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        echo "❌ npm is not installed. Please install npm before continuing."
        exit 1
    fi
    
    # Check if required npm packages are installed
    cd "$APP_PATH"
    
    # Check if couchbase package is installed
    if ! npm list couchbase | grep -q "couchbase"; then
        echo "⚠️ Couchbase SDK is not installed. It will be installed during the update process."
    fi
    
    # Check if dotenv package is installed
    if ! npm list dotenv | grep -q "dotenv"; then
        echo "⚠️ dotenv is not installed. It will be installed during the update process."
    fi
    
    echo "✅ Dependency check complete."
}

# Run dependency check
check_dependencies

# Check and create API service if needed
check_and_create_api_service

# Main loop
while true; do
    clear
    show_usage
    echo -e "\nPress Enter to continue..."
    read
done