# Discord Bots - Home

[![Release Broadcast](https://github.com/SVKruik-Organization/Discord-Bots/actions/workflows/broadcast.yml/badge.svg)](https://github.com/SVKruik-Organization/Discord-Bots/actions/workflows/broadcast.yml)
[![Deploy Bots](https://github.com/SVKruik-Organization/Discord-Bots/actions/workflows/deploy.yml/badge.svg)](https://github.com/SVKruik-Organization/Discord-Bots/actions/workflows/deploy.yml)

Welcome to the Discord bots repository. This project is a child project of the [SVKruik Organization](https://github.com/SVKruik-Organization), so you can find the issue boards there.

Below you can find some information and links to even more information.

#### Bots Overview

| Name | Purpose | Meaning | Public | CI/CD |
| - | - | - | - |
| [Apricaria](https://bots.stefankruik.com/documentation/read/Doc/Products/Discord_Bots#Apricaria) | General Purpose | [European Golden Plover](https://en.wikipedia.org/wiki/European_golden_plover) | From version v2.10.0 | Yes |
| [Apricaria CE](https://bots.stefankruik.com/documentation/read/Doc/Products/Discord_Bots#Apricaria_CE) | Concise General Purpose | [European Golden Plover](https://en.wikipedia.org/wiki/European_golden_plover) | From version v2.10.0 | Yes |
| [Stelleri](https://bots.stefankruik.com/documentation/read/Doc/Products/Discord_Bots#Stelleri) | Early-Access Features | [Steller's Eider](https://en.wikipedia.org/wiki/Steller%27s_eider) | No | No |
| [Ispidina](https://bots.stefankruik.com/documentation/read/Doc/Products/Discord_Bots#Ispidina) | TypeScript | [African Pygmy Kingfisher](https://en.wikipedia.org/wiki/Ispidina) | No | No |
| [Interpres](https://bots.stefankruik.com/documentation/read/Doc/Products/Discord_Bots#Interpres) | GitHub API | [Ruddy Turnstone](https://en.wikipedia.org/wiki/Ruddy_turnstone) | No | No |

Check the links to the documentation for more information. CE is an abbreviation for 'Concise edition'. Apricaria CE does not have the 'fun' commands like math, and ping to keep everything tidy, professional and **concise**. Some functionality is off-loaded to the main version of Apricaria. More on this where you'll never guess: on the [documentation](https://bots.stefankruik.com/documentation/read/Doc/Products/Discord_Bots#Apricaria_CE).

#### Documentation Links

- Available [commands](https://github.com/SVKruik-Organization/Discord-Bots/blob/main/Documentation/Commands.md)
- Dedicated [website](https://bots.stefankruik.com/documentation)

#### Contributing

I am very open for others joining my team. I try to make everything public, so you have full read access to the project. If you browsed around the project and think 'I can help!', don't hesitate to [reach out](https://bots.stefankruik.com/documentation/read/Doc/Contributing)!

#### Meta

- Node.js version: `v20.15.1 LTS`
- Discord.js version: `v14.15.2`
- Project version: `v2.9.0`
- Database: `MariaDB`

#### Unique Files

Stelleri and Apricaria are essentially the same bots, apart from Stelleri's faster feature-release program. But there are also some differences in the code as Stelleri uses Guild scoped commands instead of Global commands like Apricaria, among other small differences. Below you can find a list that I use for reference when bringing Apricaria up-to-speed with Stelleri. This is so that I don't replace the unique code when I bulk replace files. Also, Apricaria CE lacks some functionalities that Apricaria handles so certain files differ because of that too.

| # | Folder | Name | Reason |
| - | - | - | - |
| 1 | `commands` | `delete.js` | Discord REST API |
| 2 | `commands` | `reload.js` | Discord REST API |
| 3 | Root | `.env` | Bot Token |
| 4 | Root | `package.json` | Bot Name |
| 5 | Root | `server.js` | CORS Config |
| 6 | Root | `index.js` | Interest Rate |
| 7 | `assets` | `config.js` | Bot Name, Color, ID |
