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
    "Ubuntu" | "Debian GNU/Linux")
        echo "Installing Node.js on Ubuntu/Debian..."
        # Add NodeSource repository and install Node.js
        sudo apt-get update
        sudo apt-get install -y ca-certificates curl gnupg
        sudo mkdir -p /etc/apt/keyrings
        curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
        echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list
        sudo apt-get update
        sudo apt-get install -y nodejs
        ;;
        
    "Fedora" | "CentOS Linux" | "Red Hat Enterprise Linux")
        echo "Installing Node.js on Fedora/CentOS/RHEL..."
        # Add NodeSource repository and install Node.js
        sudo dnf install -y curl
        curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
        sudo dnf install -y nodejs
        ;;
        
    "Arch Linux")
        echo "Installing Node.js on Arch Linux..."
        sudo pacman -Sy nodejs npm
        ;;
        
    "macOS")
        echo "Installing Node.js on macOS..."
        if ! command -v brew &> /dev/null; then
            echo "Homebrew not found. Installing Homebrew..."
            /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        fi
        brew install node
        ;;
        
    *)
        echo "Unsupported operating system: $OS"
        echo "Please install Node.js manually from https://nodejs.org/"
        exit 1
        ;;
esac

# Verify installation
echo -e "\nNode.js installation completed!"
echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)" 