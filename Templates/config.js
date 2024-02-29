exports.general = {
    name: "Name",
    color: "#FFFFFF",
    clientId: "1071428183003500544", // Snowflake ID of the bot itself.
    imageURL: "https://i.imgur.com/9X7PIG0.png", // URL of the profile picture.
    creatorId: "422704748488163332", // Snowflake ID of the author Complex/Stefan Kruik.
    repository: "https://github.com/SVKruik-Organization/Discord-Bots", // URL of the code repository.
    timezone: "Europe/Amsterdam" // The timezone the bot should use for date calculations.
};

exports.cooldowns = { // Cooldown for commands in seconds.
    A: 0,
    B: 5,
    C: 15,
    D: 30,
    E: 86400
};

exports.economy = {
    levelUpFallback: 20, // Level-up reward if the guild does not have this configured.
    interestRate: 1.0005 // Hourly increment on Bank accounts.
}

exports.tier = {
    normalMessage: 5, // Normal message XP-reward if the guild does not have this configured.
    slashCommand: 15, // Slash command XP-reward if the guild does not have this configured.
    purchase: 25 // Shop purchae XP-reward if the guild does not have this configured.
};
