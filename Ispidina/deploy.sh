#!/bin/sh
export HOME=/home/svkruik
export PATH=/root/.nvm/versions/node/v20.15.1/bin:$PATH

# Git
cd ..
git config --global --add safe.directory /home/svkruik/Documents/GitHub/SK-Bots
git reset --hard
git pull
echo "Git setup complete"

# Ispidina - bots.stefankruik.com/ispidina
cd Ispidina
npm install
npm run build
npm run update 9089
[ -d logs ] || mkdir logs
echo "Ispidina update complete"

# Interpres - bots.stefankruik.com/interpres
cd ../Interpres
npm install
# npm run build
# npm run update 9090
[ -d logs ] || mkdir logs
echo "Interpres update complete"

# Monitor
cd ../Monitor
npm install --omit=dev
[ -d logs ] || mkdir logs
echo "Monitor update complete"

echo "Setup complete. Reloading Ispidina."
sudo systemctl restart bot-monitor.service
# sudo systemctl restart interpres-bot.service
sudo systemctl restart ispidina-bot.service
