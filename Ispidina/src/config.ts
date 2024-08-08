export const general = {
    name: "Ispidina",
    clientId: "1252669921242910831",
    imageURL: "https://files.stefankruik.com/Bots/Ispidina.png",
    authorId: "422704748488163332",
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

// Accent Colors
export enum colors {
    bot = "#2B8DFF",
    warning = "#FF4C4C"
}

// Website Links
export const urls = {
    website: "https://platform.stefankruik.com",
    docs: "https://platform.stefankruik.com/documentation/read/Doc/Products/Discord_Bots#Ispidina",
    skCommander: "https://platform.stefankruik.com" // TODO .com/products/commander
}

// Economy Settings
export enum economy {
    levelUpFallback = 20,
    interestRate = 1.0005
}

// Interaction Experience Rewards
export enum tier {
    react = 1,
    poll = 3,
    message = 5,
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