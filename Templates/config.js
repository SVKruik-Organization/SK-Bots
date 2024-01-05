exports.general = {
    name: "Name",
    color: "#FFFFFF",
    clientId: ["1", "2"], // Users excluded from the Level System. This can be other bots or webhooks.
    guildId: ["1", "2"], // All servers the bot is active in.
    eventChannel: "1", // The announcement channel. The message created from /event will be send here.
    suggestionChannel: "1", // The suggestion channel. The message createed from /suggest will be send here.
    snippetChannel: "1", // The snippet channel. The message createed from /snippet will be send here.
    highPowerRoles: 3, // The amount of roles that have higher power than the /role command. If the bot's rank is lower than someone else's, banning etc. is not possible. Count the bot, admins and 'blinded' roles.
    apiLimit: 1, // API Response Limit
    imageURL: "https://i.imgur.com", // https://api-ninjas.com/
    memberCountOffset: 2 // Amount of Bots
};

exports.cooldowns = {
    A: 0,
    B: 5,
    C: 15,
    D: 30,
    E: 86400
};

exports.tier = {
    normalMessage: 1,
    slashCommand: 8,
    levelUpThreshold: 30
};