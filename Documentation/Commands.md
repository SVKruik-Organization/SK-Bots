# Available Bot Commands

The following commands are production ready, and are therefore supported by both Stelleri and Virgo.

| Command | Description | Options | Elevated | Category |
| - | - | - | - | - |
| `admin` | Add or remove someone from the server specific administrators. | `target` `action` | `true` | `moderation` |
| `blind` | Add or remove someone from the server specific blinded users. | `target` `action` | `true` | `moderation` |
| `block` | Add or remove someone from the server specific blocked users. | `target` `action` | `true` | `moderation` |
| `clear` | Bulk delete recent messages. | `amount` | `true` | `moderation` |
| `close` | Close and delete your account. You will lose access to Tier & Economy system. | `pincode` | `false` | `account` |
| `coin` | Flip a coin. Specify which side is in your favor. | `side` | `false` | `fun` |
| `daily` | Collect your daily reward. There is a `1` in `50` chance you get the jackpot. | - | `false` | `economy` |
| `delete` | Delete all or specific Guild/Global commands. | `action` `id` | `dev only` | `development` |
| `dice` | Roll the dice. | - | `false` | `fun` |
| `economy` | Controls for the economy system. View balance, withdraw and deposit. | `action` `amount` | `false` | `economy` |
| `event` | Create a physical or online event where other members can participate in. | `type` `title` `description` `location` `date` `time` | `false` | `tools` |
| `fact` | Receive a random fact from the Ninja API. | - | `false` | `fun` |
| `inventory` | Checkout your inventory or (de)activate a XP-Booster. | `action` | `false` | `account` |
| `math` | Evaluate a math expression. | `expression` | `false` | `tools` |
| `modify` | Modify a user's balance of something. | `target` `action` `amount` | `true` | `account` |
| `pincode` | Change your pincode. Requires you to know the old one. Reset system WIP. | `old` `new` | `false` | `account` |
| `ping` | Ping the bot to see if it is online. A legacy command, required for v1. | - | `false` | `tools` |
| `random` | Generate a random number with a maximum. | `bound` | `false` | `tools` |
| `register` | Create an account for use of Tier & Economy commands. | `pincode` | `false` | `account` |
| `reload` | Reload all Guild/Global commands against the Discord API. | - | `dev only` | `development` |
| `report` | Report a user for violating a rule. Administrators will get notified. | `target` `category` `reason` | `false` | `tools` |
| `role` | Give yourself a custom color. Requires the color change item bought in the shop. | `color` | `false` | `fun` |
| `rps` | Play a game of Rock, Paper, Scissors. | `side` | `false` | `fun` |
| `server` | Let the bot display some server statistics. | - | `false` | `tools` |
| `setup` | Configure the bot to enable server specific commands like `event` & `snippet`.¹ | `action` `admin` `event` `suggestion` `snippet` `rules` `blind` `power` | `true` | `tools` |
| `shop` | Start a purchase dialog. You can purchase color changes & XP-Boosters. | - | `false` | `economy` |
| `shutdown` | Shutdown the bot remotely. | - | `dev only` | `tools` |
| `snippet` | Format a piece of code which will be displayed in a dedicated channel. | `language` `code` `title` | `false` | `tools` |
| `statistics` | Let the bot display some bot statistics. | - | `false` | `tools` |
| `suggestion` | Pitch an idea to the other members in a dedicated channel with voting. | `title` `description` | `false` | `tools` |
| `tier` | Displays your Tier statistics, progression and active XP-Booster. | - | `false` | `tier` |
| `warning` | Other administrators will get notified. | `target` `reason` | `true` | `moderation` |

---

Total: `32`

¹ This is for basic settings only. For advanced configuration (custom pricing, settings, and more) the [Bot Commander](https://github.com/SVKruik/bot-config-ui) app is required.
