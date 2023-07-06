# Discord Bots v2

Welcome to my Discord bot repository. This is my second time building them, now with 
some new techniques and methods. You can have a look at the old bots [here](https://github.com/SVKruik/Discord-Bots).

I will first start with an all-purpose bot, and maybe later I will split them into individual
bots again. The bot that is currently available is Stelleri. It is named after the duck species Steller's eider ([Polysticta **stelleri**](https://en.wikipedia.org/wiki/Steller%27s_eider)).

Below is a list of available commands. I will update this regularly. Last updated on:
**06/02/2023**.

#### Available Commands
| Command | Description | Parameters | Admin |
| - | - | - | - |
| `blind` | Blind or unblind `param1`. If you have the `Blinded` role, you can only see a the selected channels. | `target` `action` | `true` |
| `clear` | Bulk delete `param1` amount of messages. | `amount` | `true` |
| `close` | Close your account. Pincode input for verification. | `pincode` | `false` |
| `coin` | Flip a coin. `param1` to choose which side you placed your bet on. | `side` | `false` |
| `dailyreward` | Collect your daily reward, a random chosen Bits amount The minimum you can receive is `200`, and the maximum is `1000`. If you fill in the optional `param1`, and it equals the random daily reward amount, you win the jackpot. You will receive an additional `10000` Bits. | optional: `guess` | `false` |
| `delete` | Remove an old or duplicate slash command. | `id` | `true` |
| `dice` | Roll the dice. Returns random number. | - | `false` |
| `economy` | Controls for economy system. Withdraw, deposit or view your balance. | `action` optional: `amount` | `false` |
| `event` | Create an scheduled event. This can be used for meetings and other gatherings. You can enter various data such as location and time. The bot will then send a fancy embed in a dedicated channel. | `title` `description` `location` `date` `time` | `true` |
| `modify` | Modify the amount of `param2` a user has. You can increase, decrease, set, multiply and divide. Database editing translated into Discord UI. | `target` `section` `action` `amount` | `true` |
| `pincode` | Request or change your pincode, depending on `param1`.  | `action` optional: `new-pincode` | `false` |
| `ping` | Check if the bot is online and working. If so, the bot will respond with a random chosen message. | - | `false` |
| `random` | Generate a random number between 1 and `param1`. | `maximum` | `false` |
| `register` | Create a new account. You will also have to set your pincode, used for sensitive commands like `close`. | `pincode` | `false` |
| `report` | Report someone for misbehaving and/or breaking the rules of conduct. You can select the type, and then further explain the incident. | `target` `category` `reason` | `false` |
| `role` | Style yourself with a custom HEX role color. Prefix `#` is not needed. | `hex` | `false` |
| `rps` | Play a game of rock, paper and scissors! | `type` | `false` |
| `server` | Get information about the current server the bot is in. | - | `false` |
| `shutdown` | Shutdown the bot remotely. Like with the `close` command, you have to fill in your pincode as a precaution. | `pincode` | `true` |
| `snippet` | Let the bot format a piece of code for you, and put in a Markdown codeblock. You can select the right language for syntax highlighting. | `language` `code` optional: `title` | `false` |
| `statistics` | Get information about the bot. | - | `false` |
| `suggestion` | Create a new suggestion in a dedicated channel.  | `title` `description` optional: `when` | `false` |
| `tag` | Retrieve the Discord tag from the database. This is a misc command used primarily to check if the database is online. This command will fail if the user does not have an account yet. | `target` | `false` |
| `tier` | Get information about your level progression. | - | `false` |
| `warn` | Give someone an official warning. This is the administrator version of reporting. Unlike the `report` command, reasoning (`param2`) is optional. | `target` optional: `reason` | `true` |

#### Meta
- Node.js version: `v18.14.0 LTS`
- Discord.js version: `v14.7.1`
- Commands: `26`
- Project version: `v2.1.0`
