import { SapphireClient } from '@sapphire/framework';
import { GatewayIntentBits } from 'discord.js';
import { WinstonLogger } from './winston-logger.js';

const client = new SapphireClient({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
	logger: { instance: new WinstonLogger() }
});

async function main() {
  try {
    await client.login(process.env.DISCORD_BOT_TOKEN);
  }
  catch (error) {
    client.logger.error(error);
    process.exit(1);
  }
}

main();