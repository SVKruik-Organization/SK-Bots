# Discord Bots v2 - Home

Welcome to my second Discord bot repository. You can have a look at the old bots [here](https://github.com/SVKruik/Discord-Bots). Implementing the newest version of DJS and slash commands meant basically starting over, so I decided to make a fresh start. Feel free to browse through the code, and if you want to contribute or have questions, hit me up!

Below you will find a list of statistics, information and commands. I will update this regularly. Last updated on:

**29/01/2024**.

#### Bots Overview

| Name | Type | Commands | Info |
| - | - | - | - |
| Stelleri | General Purpose | `33` | [Steller's Eider](https://en.wikipedia.org/wiki/Steller%27s_eider) |
| Virgo | Trading | `2` | [Demoiselle Crane](https://en.wikipedia.org/wiki/Demoiselle_crane) |

#### Bot Information

Stelleri is a general purpose bot. This means it comes with large set of features, to satisfy most servers needs. Stelleri is still a WIP, which means every new release brings at least a couple of new commands for you to try out.

Virgo is a template bot for now.

#### Available Commands - Stelleri

| Command | Description | Parameters | Admin | Category |
| - | - | - | - | - |
| `admin` | Add or remove someone from the super users. | `target` `action` | `true` | Moderation |
| `ai` | Prompt ChatGPT or Dall-E for text or image generation. Requires funding, and is currently not operational. | `type` | `false` | Fun |
| `blind` | Add or remove someone from the blinded users. If you have the `Blinded` role, you can only see a the selected channels. | `target` `action` | `true` | Moderation |
| `block` | Add or remove someone from the blocked users. If you are blocked, you are unable to use the bot's commands. | `target` `action` | `true` | Moderation |
| `clear` | Bulk delete `param1` amount of messages. | `amount` | `true` | Moderation |
| `close` | Close your account. Pincode input for verification. | `pincode` | `false` | Account |
| `coin` | Flip a coin. `param1` to choose which side you placed your bet on. | `side` | `false` | Fun |
| `dailyreward` | Collect your daily reward. There is a 1 in 50 chance you win the jackpot. | - | `false` | Economy |
| `delete` | Remove an old or duplicate slash command. | `id` | `true` | Moderation |
| `dice` | Roll the dice. Returns random number. | - | `false` | Fun |
| `economy` | Controls for the Economy system. Withdraw, deposit or view your balance. | `action` `amount` | `false` | Economy |
| `event` | Create a scheduled event. The bot will send a message in a dedicated channel. | `title` `description` `location` `date` `time` | `true` | Tools |
| `fact` | Get a random interesting fact. Works with "API Ninja's" Fact endpoint. | - | `false` | Fun |
| `inventory` | View the items that you have, or activate/disable a XP-Booster. | - | `false` | Account |
| `math` | Solve a math problem. You can use all math operators like `*` and `/`. | `expression` | `false` | Tools |
| `modify` | Modify the amount of `param2` a user has. | `target` `section` `action` `amount` | `true` | Moderation |
| `pincode` | Change your pincode. Note that you have to know your current pincode, as 'Forgot Pincode' is WIP. | `old-pincode` `new-pincode` | `false` | Account |
| `ping` | Check if the bot is online and working. If so, the bot will respond with a random chosen message. | - | `false` | Tools |
| `random` | Generate a random number between 1 and `param1`. | `maximum` | `false` | Tools |
| `register` | Create a new account. You will also have to set your pincode, used for sensitive commands like `close`. | `pincode` | `false` | Account |
| `reload` | Reload a specific or all Guild and Global commands. | `action` `command` | `true` | Moderation |
| `report` | Report someone for misbehaving and/or breaking the rules of conduct. You can select the type, and then further explain the incident. | `target` `category` `reason` | `false` | Moderation |
| `role` | Style yourself with a custom HEX role color. Prefix `#` is not needed. | `hex` | `false` | Fun |
| `rps` | Play a game of rock, paper and scissors! | `type` | `false` | Fun |
| `server` | Get information about the current server the bot is in. | - | `false` | Tools |
| `setup` | Configure the bot for server specific commands to work. | `action` `action-options` | `true` | Tools |
| `shop` | Spend your Bits on cool perks or cosmetics. | `action` `action-options` | `false` | Tools |
| `shutdown` | Shutdown the bot remotely. | - | `true` | Tools |
| `snippet` | Let the bot format a piece of code for you, and send it to a dedicated channel. | `language` `code` optional: `title` | `false` | Tools |
| `statistics` | Get information about the bot. | - | `false` | Tools |
| `suggestion` | Create a new suggestion in a dedicated channel.  | `title` `description` optional: `when` | `false` | Tools |
| `tier` | Get information about your level progression. | - | `false` | Tier |
| `warn` | Give someone an official warning. This is the administrator version of reporting. Unlike the `report` command, reasoning (`param2`) is optional. | `target` optional: `reason` | `true` | Moderation |

#### Available Commands - Virgo

| Command | Description | Parameters | Admin |
| - | - | - | - |
| `ping` | Check if the bot is online and working. If so, the bot will respond with a random chosen message. | - | `false` |
| `shutdown` | Shutdown the bot remotely. | - | `true` |

#### Meta

- Node.js version: `v20.10.0 LTS`
- Discord.js version: `v14.7.1`
- Project version: `v2.5.0`
- Database: `MariaDB`
