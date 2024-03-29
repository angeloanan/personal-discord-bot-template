import 'dotenv/config'

import { container, LogLevel, SapphireClient } from '@sapphire/framework'
import { ActivityType } from 'discord.js'
// import { drizzle } from 'drizzle-orm/libsql'
// import { createClient } from '@libsql/client'

export class BotClient extends SapphireClient {
	public constructor() {
		super({
			intents: ['Guilds', 'GuildMessages'],
			allowedMentions: { parse: ['roles', 'users'] },
			presence: {
				afk: true,
				status: 'idle',
				activities: [
					{
						name: 'for the ready signal',
						type: ActivityType.Watching
					}
				]
			},
			logger: { level: LogLevel.Debug }
		})
	}

	public override async login(token?: string) {
		// const libsqlClient = createClient({
		// 	url: process.env.DATABASE_URL ?? 'file:database.db',
		// 	authToken: process.env.DATABASE_AUTH_TOKEN
		// })

		// container.database = drizzle(libsqlClient)
		container.logger.info('Bot logging in...')
		return super.login(token)
	}

	public override async destroy() {
		// container.logger.info(`Disconnecting from database...`)
		// await container.database.$disconnect()
		// container.logger.info(`Disconnected from database.`)
		return super.destroy()
	}
}

// Module augmentation for container
declare module '@sapphire/pieces' {
	// biome-ignore lint/suspicious/noEmptyInterface: Inject your `Client` types here!
	interface Container {
		// database: typeof drizzle
	}
}

// Module augmentation for Discord
declare module 'discord.js' {
	// biome-ignore lint/suspicious/noEmptyInterface: Augment custom events here!
	interface ClientEvents {
		// CustomEvent: {}
	}
}

const client = new BotClient()

// Handle graceful exit
process.on('SIGUSR2', () => {
	console.log('[nodemon] restarting process, shutting down gracefully')
	// biome-ignore lint/complexity/noVoid: Shutting down
	void client.destroy().then()
	process.exit()
})

process.on('SIGINT', () => {
	console.log('SIGINT received, shutting down gracefully')
	// biome-ignore lint/complexity/noVoid: Shutting down
	void client.destroy().then()
	process.exit()
})

process.on('SIGTERM', () => {
	console.log('SIGTERM received, shutting down gracefully')
	// biome-ignore lint/complexity/noVoid: Shutting down
	void client.destroy().then()
	process.exit()
})

client.login(process.env.BOT_TOKEN).catch((e) => {
	console.error(e)
})
