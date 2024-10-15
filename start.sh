#!/bin/bash

USER_ID=$1

echo "USER_ID: $USER_ID"

if [ -z "$USER_ID" ]; then
  echo "Использование: bash start.sh <USER_ID>>"
  exit 1
fi

sudo apt update
sudo apt install -y curl

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

nvm install 18
nvm use 18

node -v
npm -v

npm install archiver

node script.js $USER_ID
