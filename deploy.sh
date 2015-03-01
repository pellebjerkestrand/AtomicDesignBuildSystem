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
KUDU_SYNC_CMD=${KUDU_SYNC_CMD//\"}

echo "OSTYPE is \"$OSTYPE\"."
if [[ $OSTYPE == "msys" ]]; then
  # Azure reports "msys"
  PATH_SEP="\\"
else
  PATH_SEP="/"
fi
echo "PATH_SEP is \"$PATH_SEP\"."

if [[ ! -n "$DEPLOYMENT_SOURCE" ]]; then
  echo "Setting DEPLOYMENT_SOURCE to \"$SCRIPT_DIR\"."
  DEPLOYMENT_SOURCE=$SCRIPT_DIR
else
  echo "DEPLOYMENT_SOURCE is \"$DEPLOYMENT_SOURCE\"."
fi

if [[ ! -n "$NEXT_MANIFEST_PATH" ]]; then
  echo "Setting NEXT_MANIFEST_PATH to \"$ARTIFACTS/manifest\"."
  NEXT_MANIFEST_PATH=$ARTIFACTS/manifest

  if [[ ! -n "$PREVIOUS_MANIFEST_PATH" ]]; then
    echo "Setting PREVIOUS_MANIFEST_PATH to \"$NEXT_MANIFEST_PATH\"."
    PREVIOUS_MANIFEST_PATH=$NEXT_MANIFEST_PATH
  else
    echo "PREVIOUS_MANIFEST_PATH is \"$PREVIOUS_MANIFEST_PATH\"."
  fi
else
  echo "NEXT_MANIFEST_PATH is \"$NEXT_MANIFEST_PATH\"."
fi

if [[ ! -n "$DEPLOYMENT_TARGET" ]]; then
  echo "Setting DEPLOYMENT_TARGET to \"$ARTIFACTS/wwwroot\"."
  DEPLOYMENT_TARGET=$ARTIFACTS/wwwroot
else
  echo "DEPLOYMENT_TARGET is \"$DEPLOYMENT_TARGET\"."
  KUDU_SERVICE=true
fi

if [[ ! -n "$KUDU_SYNC_CMD" ]]; then
  # Install kudu sync
  echo "Installing Kudu Sync"
  npm install kudusync -g --silent
  exitWithMessageOnError "npm failed"

  if [[ ! -n "$KUDU_SERVICE" ]]; then
    # In case we are running locally this is the correct location of kuduSync
    KUDU_SYNC_CMD=kuduSync
  else
    # In case we are running on kudu service this is the correct location of kuduSync
    KUDU_SYNC_CMD=$APPDATA/npm/node_modules/kuduSync/bin/kuduSync
  fi
fi

# Node Helpers
selectNodeVersion () {
  if [[ -n "$KUDU_SELECT_NODE_VERSION_CMD" ]]; then
    SELECT_NODE_VERSION="$KUDU_SELECT_NODE_VERSION_CMD \"$DEPLOYMENT_SOURCE\" \"$DEPLOYMENT_TARGET\" \"$DEPLOYMENT_TEMP\""
    eval $SELECT_NODE_VERSION
    exitWithMessageOnError "select node version failed"

    if [[ -e "$DEPLOYMENT_TEMP/__nodeVersion.tmp" ]]; then
      NODE_EXE=`cat "$DEPLOYMENT_TEMP/__nodeVersion.tmp"`
      exitWithMessageOnError "getting node version failed"
    fi
    
    if [[ -e "$DEPLOYMENT_TEMP/.tmp" ]]; then
      NPM_JS_PATH=`cat "$DEPLOYMENT_TEMP/__npmVersion.tmp"`
      exitWithMessageOnError "getting npm version failed"
    fi

    if [[ ! -n "$NODE_EXE" ]]; then
      NODE_EXE=node
    fi

    NPM_CMD="\"$NODE_EXE\" \"$NPM_JS_PATH\""
  else
    NPM_CMD=npm
    NODE_EXE=node
  fi

  echo "NPM_CMD is \"$NPM_CMD\"."
  echo "NODE_EXE is \"$NODE_EXE\"."
}

# Build
echo "Building."

# Select node version
selectNodeVersion

# Install npm packages
if [ -e "$DEPLOYMENT_SOURCE/package.json" ]; then
    echo "Installing npm packages."
    eval $NPM_CMD install
    exitWithMessageOnError "npm failed"
fi

# Install and run Gulp
if [ -e "$DEPLOYMENT_SOURCE/gulpfile.js" ]; then
    echo "Installing Gulp."
    eval $NPM_CMD install -g gulp
    exitWithMessageOnError "gulp global install failed"
    echo "Executing Gulp."
    ./node_modules/.bin/gulp
    exitWithMessageOnError "gulp failed"
fi

# Install and run Grunt
if [ -e "$DEPLOYMENT_SOURCE/gruntfile.js" ]; then
    echo "Installing Grunt CLI."
    eval $NPM_CMD install grunt-cli
    exitWithMessageOnError "grunt-cli install failed"
    echo "Executing Grunt."
    ./node_modules/.bin/grunt
    exitWithMessageOnError "grunt failed"
fi

# "Deploy"
if [ -d "$DEPLOYMENT_SOURCE""$PATH_SEP""dist" ]; then
    echo "Deploying."
    mkdir -p "$DEPLOYMENT_TARGET"
    DEP="$DEPLOYMENT_SOURCE""$PATH_SEP""dist""$PATH_SEP""."
    echo "Copying \"$DEP\" to \"$DEPLOYMENT_TARGET\"."
    cp -R $DEP "$DEPLOYMENT_TARGET"
fi

# Post deployment stub
if [[ -n "$POST_DEPLOYMENT_ACTION" ]]; then
  POST_DEPLOYMENT_ACTION=${POST_DEPLOYMENT_ACTION//\"}
  cd "${POST_DEPLOYMENT_ACTION_DIR%\\*}"
  "$POST_DEPLOYMENT_ACTION"
  exitWithMessageOnError "post deployment action failed"
fi

echo "Finished successfully."
