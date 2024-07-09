# Discord Bots - Home

[![Release Broadcast](https://github.com/SVKruik-Organization/Discord-Bots/actions/workflows/broadcast.yml/badge.svg)](https://github.com/SVKruik-Organization/Discord-Bots/actions/workflows/broadcast.yml)

Welcome to the Discord bots repository. This project is a child project of the [SVKruik Organization](https://github.com/SVKruik-Organization), so you can find the issue boards there.

Below you can find some information and links to even more information.

#### Bots Overview

| Name | Purpose | Meaning | Public |
| - | - | - | - |
| Apricaria | General Purpose | [European Golden Plover](https://en.wikipedia.org/wiki/European_golden_plover) | From version v2.9.0 |
| Interpres | GitHub API | [Ruddy Turnstone](https://en.wikipedia.org/wiki/Ruddy_turnstone) | No |
| Stelleri | Testing | [Steller's Eider](https://en.wikipedia.org/wiki/Steller%27s_eider) | No |
| Ispidina | TypeScript | [African Pygmy Kingfisher](https://en.wikipedia.org/wiki/Ispidina) | No |

#### Documentation Links

- Available [commands](https://github.com/SVKruik-Organization/Discord-Bots/blob/main/Documentation/Commands.md)
- . . .

#### Contributing

I am very open for others joining my team. I try to make everything public, so you have full read access to the project. If you browsed around the project and think 'I can help!', don't hesitate to [reach out](mailto:sv.kruik@gmail.com?subject=SVKruik%20Organization%20Contributing&body=Please%20specify%20in%20what%20part%20of%20the%20infrastructure%20you%20would%20like%20to%20contribute.%0A%0AOr%20just%20ask%20for%20my%20other%20modes%20of%20communication%2C%20and%20we%20can%20link!)!

#### Meta

- Node.js version: `v20.14.0 LTS`
- Discord.js version: `v14.15.2`
- Project version: `v2.9.0`
- Database: `MariaDB`

#### Unique Files

Stelleri and Apricaria are essentially the same bots, apart from Stelleri's faster feature-release program. But there are also some differences in the code as Stelleri uses Guild scoped commands instead of Global commands like Apricaria, among other small differences. Below you can find a list that I use for reference when bringing Apricaria up-to-speed with Stelleri. This is so that I don't replace the unique code when I bulk replace files.

| # | Folder | Name | Type |
| - | - | - | - |
| 1 | `commands` | `delete.js` | JavaScript |
| 2 | `commands` | `reload.js` | JavaScript |
| 3 | Root | `.env` | Environment Variables |
| 4 | Root | `package.json` | JSON |
| 5 | Root | `server.js` | JavaScript |
