# Discord Bots v2

Welcome to my Discord bot repository. This is my second time building them, now with 
some new techniques. You can have a look at the old bots [here](https://github.com/PuffinKwadraat/Discord-Bots).

I will first start with an all-purpose bot, and maybe later I will split them into individual
bots again. The bot that is currently available is Stelleri. It is named after the Steller's
eider, a species of duck.

Below is a list of available commands. I will update this regularly. Last updated on:
**06/02/2023**.

#### Available Commands
| Command | Description | Params | Admin |
| - | - | - | - |
| `clear` | Bulk delete messages. | `amount` | `true` |
| `close` | Close your account. Pincode input for verification. | `pincode` | `false` |
| `delete` | Delete an old or duplicate slash command. | `id` | `true` |
| `coin` | Flip a coin. Input to choose which side you placed your bet on. | `side` | `false` |
| `event` | Create an event. This can be used for meetings and other gatherings. You can give a lot of data (time, location etc), and the bot will send an fancy embed in a dedicated channel. | `title` `description` `location` `date` `time` | `true` |
| `modify` | Modify the amount of `param2` a user has. You can increase, decrease, set, multiply and divide. Database editing translated into Discord UI. | `target` `section` `action` `amount` | `true` |
| `pincode` | Request or change your pincode, depending on `param1`.  | `action` optional: `new-pincode` | `false` |
| `ping` | Check if the bot is online and working. If so, the bot will respond with a random chosen message. | | `false` |
| `random` | Generate a random number between 1 and `param1`. | `maximum` | `false` |
| `register` | Create a new account. You will also have to set your pincode, used for sensitive commands like `close`. | `pincode` | `false` |
| `report` | Report someone for misbehaving and/or breaking the rules of conduct. You can select the type, and then further explain the incident. | `target` `category` `reason` | `false` |
| `shutdown` | Shutdown the bot remotely. Like with the `close` command, you have to fill in your pincode as a precaution. | `pincode` | `true` |
| `tag` | Retrieve the Discord tag from the database. This is a misc command used primarily to check if the database is online. This command will fail if the user does not have an account yet. | `target` | `false` |
| `warn` | Give someone an official warning. This is the administrator version of reporting. Params include the target and optional reasoning. | `target` optional: `reason` | `true` |
