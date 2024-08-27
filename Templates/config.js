exports.general = {
    name: "Name",
    clientId: "123456789012345678", // Snowflake ID of the bot itself.
    imageURL: "https://files.stefankruik.com/Products", // URL of the profile picture.
    authorId: "422704748488163332", // Snowflake ID of the author Complex/Stefan Kruik.
    timezone: "Europe/Amsterdam" // The timezone the bot should use for date calculations.
};

// Command Cooldowns (admins exempt)
exports.cooldowns = { // Cooldown for different command categories in seconds.
    A: 0,
    B: 5,
    C: 15,
    D: 30,
    E: 86400
};

// Accent Colors
exports.colors = {
    bot: "#FFFFFF", // Accent color of the bot itself.
    warning: "#FF4C4C" // Accent color of warning messages like high temperature.
}

// Website Links
exports.urls = { // Links to several resources.
    website: "https://platform.stefankruik.com",
    docs: "https://platform.stefankruik.com/documentation/read/Doc/Products/Discord_Bots",
    skCommander: "https://platform.stefankruik.com"
}

// Economy Settings
exports.economy = {
    levelUpFallback: 20, // Level-up base reward if the guild does not have this configured.
    interestRate: 1.0005 // Hourly increment on all Bank accounts.
}

// Interaction Experience Rewards
exports.tier = {
    react: 1, // Message reaction XP-reward if the guild does not have this configured.
    poll: 3, // Poll vote XP-reward if the guild does not have this configured.
    message: 5, // Normal message XP-reward if the guild does not have this configured.
    slashCommand: 15, // Slash command XP-reward if the guild does not have this configured.
    purchase: 25 // Shop purchase XP-reward if the guild does not have this configured.
};

// Operator Plans
exports.edition = {
    basicSeats: 1, // Amount of Operator seats for plan 'Basic'.
    basicServers: 3, // Amount of managable servers for plan 'Basic'.
    professionalSeats: 3, // Amount of Operator seats for plan 'Professional'.
    professionalServers: 5, // Amount of managable servers for plan 'Professional'.
    enterpriseSeats: 10, // Amount of Operator seats for plan 'Enterprise'.
    enterpriseServers: 25 // Amount of managable servers for plan 'Enterprise'.
}