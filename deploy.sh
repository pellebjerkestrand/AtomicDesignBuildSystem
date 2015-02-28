#!/bin/bash

# Helpers
exitWithMessageOnError () {
  if [ ! $? -eq 0 ]; then
    echo "An error has occurred during web site deployment."
    echo $1
    exit 1
  fi
}

# Prerequisites
# Verify node.js installed
hash node 2>/dev/null
exitWithMessageOnError "Missing node.js executable, please install node.js, if already installed make sure it can be reached from current environment."

# Setup
SCRIPT_DIR="${BASH_SOURCE[0]%\\*}"
SCRIPT_DIR="${SCRIPT_DIR%/*}"
ARTIFACTS=$SCRIPT_DIR/../artifacts
DEPLOYMENT_TARGET=$ARTIFACTS/wwwroot

if [[ ! -n "$DEPLOYMENT_SOURCE" ]]; then
  DEPLOYMENT_SOURCE=$SCRIPT_DIR
fi

# Build
echo "Building."

# Install npm packages
if [ -e "$DEPLOYMENT_SOURCE/package.json" ]; then
    echo "Installing npm packages."
    eval npm install
    exitWithMessageOnError "npm failed"
fi

# Install and run Gulp
if [ -e "$DEPLOYMENT_SOURCE/gulpfile.js" ]; then
    echo "Installing Gulp."
    eval npm install -g gulp
    exitWithMessageOnError "gulp global install failed"
    echo "Executing Gulp."
    ./node_modules/.bin/gulp
    exitWithMessageOnError "gulp failed"
fi

# Install and run Grunt
if [ -e "$DEPLOYMENT_SOURCE/gruntfile.js" ]; then
    echo "Installing Grunt CLI."
    eval npm install grunt-cli
    exitWithMessageOnError "grunt-cli install failed"
    echo "Executing Grunt."
    ./node_modules/.bin/grunt
    exitWithMessageOnError "grunt failed"
fi

# "Deploy"
if [ -d "$DEPLOYMENT_SOURCE/dist" ]; then
    echo "Deploying."
    mkdir -p "$DEPLOYMENT_TARGET"
    cp -R "$DEPLOYMENT_SOURCE/dist/*" "$DEPLOYMENT_TARGET"
fi

echo "Finished successfully."