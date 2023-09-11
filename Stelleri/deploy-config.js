const settings = './assets/settings.json';
const fs = require("fs");

update("eventId", "1072476767991906354");

/**
 * Update the config.json with new values.
 * @param {string} key Target JSON key.
 * @param {string} value New value.
 * @returns On error.
 */
function update(key, value) {
    if (key == undefined || value == undefined) {
        return console.log("\n[ERROR] Invalid key/value pair provided.\n");
    }
    fs.readFile(settings, "utf8", (err, jsonString) => {
        if (err) {
            console.log("File read failed:", err);
            return;
        };

        if (key == "eventId" || key == "guildId") {
            if (value.length < 18) {
                return console.log("\n[ERROR] Invalid Snowflake valid provided.\n");
            };
        };

        const data = JSON.parse(jsonString);
        data[key] = value;

        fs.writeFile(settings, JSON.stringify(data, null, 2), err => {
            if (err) console.log("\n[ERROR] Error writing file:", err);
        });
        console.log(`\n[INFO] Write succes. -- Changes: ${key} = ${value}.\n`);
    });
};
