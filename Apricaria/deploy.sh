#!/bin/sh
export HOME=/home/svkruik

# Git
cd ..
git config --global --add safe.directory "$HOME/Documents/GitHub/SK-Bots"
git reset --hard
git pull
echo "Git setup complete"

# Apricaria - bots.stefankruik.com/apricaria
cd Apricaria
npm install --omit=dev
npm run update 9087
[ -d logs ] || mkdir logs
echo "Apricaria update complete"

# Stelleri - bots.stefankruik.com/stelleri
cd ../Stelleri
npm install --omit=dev
[ -d logs ] || mkdir logs
echo "Stelleri update complete"

# Ispidina - bots.stefankruik.com/ispidina
cd ../Ispidina
npm install --omit=dev
npm run build
npm run update 9089
[ -d logs ] || mkdir logs
echo "Ispidina update complete"

# Interpres - bots.stefankruik.com/interpres
cd ../Interpres
npm install --omit=dev
# npm run build
# npm run update 9090
[ -d logs ] || mkdir logs
echo "Interpres update complete"

echo "Setup complete. Reloading the bots."
sudo systemctl restart stelleri-bot.service
sudo systemctl restart ispidina-bot.service
# sudo systemctl restart interpres-bot.service
sudo systemctl restart apricaria-bot.service
