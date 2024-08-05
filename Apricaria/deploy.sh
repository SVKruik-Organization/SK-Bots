#!/bin/sh
export HOME=/home/SVKruik
export PATH=/root/.nvm/versions/node/v20.15.1/bin:$PATH

# Git
cd ..
git config --global --add safe.directory /home/SVKruik/Documents/GitHub/Discord-Bots
git reset --hard
git pull
echo "Git setup complete"

# Apricaria - api.stefankruik.com/apricaria
cd Apricaria
npm install
npm run update
[ -d logs ] || mkdir logs
echo "Apricaria update complete"

# Stelleri - api.stefankruik.com/stelleri
cd ../Stelleri
npm install
npm run update
[ -d logs ] || mkdir logs
echo "Stelleri update complete"

# Monitor
cd ../Monitor
npm install
[ -d logs ] || mkdir logs
echo "Monitor update complete"

echo "Setup complete. Reloading Apricaria & Stelleri."
sudo systemctl restart stelleri-bot.service
sudo systemctl restart bot-monitor.service
sudo systemctl restart apricaria-bot.service
