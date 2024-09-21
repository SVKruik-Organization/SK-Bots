exports.general = {
    name: "Apricaria",
    clientId: "1150713787784110110",
    imageURL: "https://files.stefankruik.com/Products/Apricaria.png",
    authorId: "422704748488163332",
    timezone: "Europe/Amsterdam"
};

// Command Cooldowns (admins exempt)
exports.cooldowns = {
    A: 0,
    B: 5,
    C: 15,
    D: 30,
    E: 86400
};

// Accent Colors
exports.colors = {
    bot: "#898266",
    warning: "#FF4C4C"
}

// Website Links
exports.urls = {
    website: "https://platform.stefankruik.com",
    docs: "https://platform.stefankruik.com/documentation/read/Doc/Products/Bots#Apricaria",
    skCommander: "https://platform.stefankruik.com" // TODO .com/products/commander
}

// Economy Settings
exports.economy = {
    levelUpFallback: 20,
    interestRate: 1.0005
}

// Interaction Experience Rewards
exports.tier = {
    react: 1,
    poll: 3,
    message: 5,
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