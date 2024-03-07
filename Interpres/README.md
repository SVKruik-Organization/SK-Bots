# Interpres GitHub API Discord Bot

To start local development on the webhook(s), follow these steps:

1. Update the [webhook](https://github.com/organizations/SVKruik-Organization/settings/hooks) payload URL to the Smee channel.

2. Run the following command:

```bash
npm run smee -- --url SMEE_CHANNEL_HERE
```

3. When done working on the webhook, revert the [webhook](https://github.com/organizations/SVKruik-Organization/settings/hooks) payload URL back to the following string:

```txt
https://www.stefankruik.nl/api/interpres/github/webhook
```
