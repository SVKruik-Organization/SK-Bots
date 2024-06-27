const general = {
    name: "Ispidina",
    color: "#2B8DFF",
    clientId: "1252669921242910831",
    imageURL: "https://i.imgur.com/KsXYfv4.jpeg",
    authorSnowflake: "422704748488163332",
    timezone: "Europe/Amsterdam",
};

// Command Cooldowns (admins exempt)
export enum cooldowns {
    A = 0,
    B = 5,
    C = 15,
    D = 30,
    E = 86400
};

// Website Links
const urls = {
    website: "https://bots.stefankruik.com",
    botRepository: "https://github.com/SVKruik-Organization/Discord-Bots",
    botCommanderRepository: "https://github.com/SVKruik-Organization/Bot-Commander",
    botCommanderWebsite: "https://bots.stefankruik.com" // .com/products/commander
}

// Economy Settings
export enum economy {
    levelUpFallback = 20,
    interestRate = 1.0005
}

// Interaction Experience Rewards
export enum tier {
    normalMessage = 5,
    slashCommand = 15,
    purchase = 25
};

// Operator Plans
export enum edition {
    basicSeats = 1,
    basicServers = 3,
    professionalSeats = 3,
    professionalServers = 5,
    enterpriseSeats = 10,
    enterpriseServers = 25
}

export { general, urls }