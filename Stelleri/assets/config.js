exports.general = {
    name: "Stelleri",
    color: "#E4B081",
    clientId: "1071428183003500544",
    imageURL: "https://i.imgur.com/9X7PIG0.png",
    authorSnowflake: "422704748488163332",
    timezone: "Europe/Amsterdam",
};

// Command Cooldowns (admins exempt)
exports.cooldowns = {
    A: 0,
    B: 5,
    C: 15,
    D: 30,
    E: 86400
};

// Website Links
exports.urls = {
    website: "https://bots.stefankruik.com",
    docs: "https://bots.stefankruik.com/documentation/read/Doc/Products/Discord_Bots#Stelleri",
    botCommanderWebsite: "https://bots.stefankruik.com" // TODO .com/products/commander
}

// Economy Settings
exports.economy = {
    levelUpFallback: 20,
    interestRate: 1.0005
}

// Interaction Experience Rewards
exports.tier = {
    normalMessage: 5,
    slashCommand: 15,
    purchase: 25
};

// Operator Plans
exports.edition = {
    basicSeats: 1,
    basicServers: 3,
    professionalSeats: 3,
    professionalServers: 5,
    enterpriseSeats: 10,
    enterpriseServers: 25
}