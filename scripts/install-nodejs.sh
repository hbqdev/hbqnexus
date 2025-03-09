#!/bin/bash

# Function to detect OS
detect_os() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$NAME
    elif [ -f /etc/lsb-release ]; then
        . /etc/lsb-release
        OS=$DISTRIB_ID
    elif [ "$(uname)" == "Darwin" ]; then
        OS="macOS"
    else
        OS="Unknown"
    fi
    echo $OS
}

# Install Node.js based on OS
OS=$(detect_os)
echo "Detected OS: $OS"

case $OS in
    "Ubuntu" | "Debian GNU/Linux" | "Linux Mint")
        echo "Installing Node.js on Ubuntu/Debian..."
        # Add NodeSource repository and install Node.js
        sudo apt-get update
        sudo apt-get install -y ca-certificates curl gnupg
        sudo mkdir -p /etc/apt/keyrings
        curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
        echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list
        sudo apt-get update
        sudo apt-get install -y nodejs
        
        # Install dependencies for Couchbase SDK
        echo "Installing dependencies for Couchbase SDK..."
        sudo apt-get install -y libcouchbase-dev build-essential python3
        ;;
        
    "Fedora" | "CentOS Linux" | "Red Hat Enterprise Linux")
        echo "Installing Node.js on Fedora/CentOS/RHEL..."
        # Add NodeSource repository and install Node.js
        sudo dnf install -y curl
        curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
        sudo dnf install -y nodejs
        
        # Install dependencies for Couchbase SDK
        echo "Installing dependencies for Couchbase SDK..."
        sudo dnf install -y libcouchbase-devel gcc-c++ python3
        ;;
        
    "Arch Linux")
        echo "Installing Node.js on Arch Linux..."
        sudo pacman -Sy nodejs npm
        
        # Install dependencies for Couchbase SDK
        echo "Installing dependencies for Couchbase SDK..."
        sudo pacman -Sy libcouchbase base-devel python
        ;;
        
    "macOS")
        echo "Installing Node.js on macOS..."
        if ! command -v brew &> /dev/null; then
            echo "Homebrew not found. Installing Homebrew..."
            /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        fi
        brew install node
        
        # Install dependencies for Couchbase SDK
        echo "Installing dependencies for Couchbase SDK..."
        brew install libcouchbase
        ;;
        
    *)
        echo "Unsupported operating system: $OS"
        echo "Please install Node.js manually from https://nodejs.org/"
        echo "And install libcouchbase for your platform"
        exit 1
        ;;
esac

# Verify installation
echo -e "\nNode.js installation completed!"
echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"

# Install global packages
echo -e "\nInstalling global packages..."
sudo npm install -g vite @vitejs/plugin-vue

# Install additional packages for Couchbase
echo -e "\nInstalling packages for Couchbase integration..."
sudo npm install -g express cors

# Verify global installations
echo -e "\nGlobal packages installed:"
echo "Vite version: $(vite --version)"

# Create systemd service file for API server
echo -e "\nCreating systemd service file for API server..."
SERVICE_NAME="hbqnexus-api"
APP_PATH=$(pwd)

cat > /tmp/$SERVICE_NAME.service << EOF
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

echo -e "\nTo install the API server as a service, run:"
echo "sudo mv /tmp/$SERVICE_NAME.service /etc/systemd/system/"
echo "sudo systemctl daemon-reload"
echo "sudo systemctl enable $SERVICE_NAME"
echo "sudo systemctl start $SERVICE_NAME" 