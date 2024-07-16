#!/bin/sh
export HOME=/home/svkruik
export PATH=/root/.nvm/versions/node/v20.15.1/bin:$PATH

# Git
cd ..
git config --global --add safe.directory /home/svkruik/Documents/GitHub/Discord-Bots
git reset --hard
git pull
echo "Git setup complete"

# Apricaria - api.stefankruik.com/apricaria
cd Apricaria
npm install
systemctl restart apricaria-bot.service
echo "Restarted Apricaria Production bot."

# Stelleri - api.stefankruik.com/stelleri
cd ../Stelleri
npm install
systemctl restart stelleri-bot.service
echo "Restarted Stelleri Beta bot."
