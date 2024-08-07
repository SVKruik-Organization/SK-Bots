const general = {
    name: "Ispidina",
    color: "#2B8DFF",
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

// Website Links
const urls = {
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