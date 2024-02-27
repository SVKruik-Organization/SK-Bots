# Available Bot Commands

The following commands are production ready, and are therefore supported by both Stelleri and Virgo.

| Command | Description | Options | Elevated | Category | Introduction |
| - | - | - | - | - | - |
| `admin` | Add or remove someone from the server specific administrators. | `target` `action` | `true` | `moderation` | `v2.3.0` |
| `blind` | Add or remove someone from the server specific blinded users. | `target` `action` | `true` | `moderation` | `v2.1.0` |
| `block` | Add or remove someone from the server specific blocked users. | `target` `action` | `true` | `moderation` | `v2.0.0` |
| `clear` | Bulk delete recent messages. | `amount` | `true` | `moderation` | `v2.1.0` |
| `close` | Close and delete your account. You will lose access to Tier & Economy system. | `pincode` | `false` | `account` | `v2.0.0` |
| `coin` | Flip a coin. Specify which side is in your favor. | `side` | `false` | `fun` | `v2.0.0` |
| `daily` | Collect your daily reward. There is a `1` in `50` chance you get the jackpot. | - | `false` | `economy` | `v2.1.0` |
| `delete` | Delete all or specific Guild/Global commands. | `action` `id` | `dev only` | `development` | `v2.0.0` |
| `dice` | Roll the dice. | - | `false` | `fun` | `v2.0.0` |
| `economy` | Controls for the economy system. View balance, withdraw and deposit. | `action` `amount` | `false` | `economy` | `v2.0.0` |
| `event` | Create a physical or online event where other members can participate in. | `type` `title` `description` `location` `date` `time` | `false` | `tools` | `v2.0.0` |
| `fact` | Receive a random fact from the Ninja API. | - | `false` | `fun` | `v2.2.0` |
| `inventory` | Checkout your inventory or (de)activate a XP-Booster. | `action` | `false` | `account` | `v2.5.0` |
| `math` | Evaluate a math expression. | `expression` | `false` | `tools` | `v2.0.0` |
| `modify` | Modify a user's balance of something. | `target` `action` `amount` | `true` | `account` | `v2.0.0` |
| `pincode` | Change your pincode. Requires you to know the old one. Reset system WIP. | `old` `new` | `false` | `account` | `v2.0.0` |
| `ping` | Ping the bot to see if it is online and working. | - | `false` | `tools` | `v2.0.0` |
| `random` | Generate a random number with a maximum. | `bound` | `false` | `tools` | `v2.0.0` |
| `register` | Create an account for use of Tier & Economy commands. | `pincode` | `false` | `account` | `v2.0.0` |
| `reload` | Reload all Guild/Global commands against the Discord API. | - | `dev only` | `development` | `v2.5.0` |
| `report` | Report a user for violating a rule. Administrators will get notified. | `target` `category` `reason` | `false` | `tools` | `v2.0.0` |
| `role` | Give yourself a custom color. Requires the color change item bought in the shop. | `color` | `false` | `fun` | `v2.0.0` |
| `rps` | Play a game of Rock, Paper, Scissors. | `side` | `false` | `fun` | `v2.1.0` |
| `server` | Let the bot display some server statistics. | - | `false` | `tools` | `v2.0.0` |
| `setup` | Configure the bot to enable server specific commands like `event` & `snippet`.¹ | `action` `admin` `event` `suggestion` `snippet` `rules` `blind` `power` | `true` | `tools` | `v2.4.0` |
| `shop` | Start a purchase dialog. You can purchase color changes & XP-Boosters. | - | `false` | `economy` | `v2.5.0` |
| `shutdown` | Shutdown the bot remotely. | - | `dev only` | `tools` | `v2.0.0` |
| `snippet` | Format a piece of code which will be displayed in a dedicated channel. | `language` `code` `title` | `false` | `tools` | `v2.1.0` |
| `statistics` | Let the bot display some bot statistics. | - | `false` | `tools` | `v2.0.0` |
| `suggestion` | Pitch an idea to the other members in a dedicated channel with voting. | `title` `description` | `false` | `tools` | `v2.0.0` |
| `tier` | Displays your Tier statistics, progression and active XP-Booster. | - | `false` | `tier` | `v2.0.0` |
| `warning` | Other administrators will get notified. | `target` `reason` | `true` | `moderation` | `v2.0.0` |

---

Total: `32`

¹ This is for basic settings only. For advanced configuration (custom pricing, settings, and more) the [Bot Commander](https://github.com/SVKruik/bot-config-ui) app is required.
