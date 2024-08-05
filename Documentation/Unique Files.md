# 

Stelleri and Apricaria are essentially the same bots, apart from Stelleri's faster feature-release program. But there are also some differences in the code as Stelleri uses Guild scoped commands instead of Global commands like Apricaria, among other small differences. Below you can find a list that I use for reference when bringing Apricaria up-to-speed with Stelleri. This is so that I don't replace the unique code when I bulk replace files. Also, Apricaria CE lacks some functionalities that Apricaria handles so certain files differ because of that too.

| # | Location | Name | Reason |
| - | - | - | - |
| 1 | `commands` | `delete.js` | Discord REST API |
| 2 | `commands` | `reload.js` | Discord REST API |
| 3 | Root | `.env` | Bot Token |
| 4 | Root | `package.json` | Bot Name |
| 5 | Root | `server.js` | CORS Config |
| 6 | Root | `index.js` | Interest Rate |
| 7 | `assets` | `config.js` | Bot Name, Color, ID |
| 8 | Root | `uplink.js` | Uplink Tasks |
