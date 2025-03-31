import 'dotenv/config'

import { container, LogLevel, SapphireClient } from '@sapphire/framework'
import { ActivityType } from 'discord.js'
import { drizzle, type LibSQLDatabase } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
// biome-ignore lint/style/noNamespaceImport: Schema import
import * as schema from './db/schema.js'

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
    const libsqlClient = createClient({
      url: process.env.DATABASE_URL ?? 'file:database.db'
    })

    container.database = drizzle({ client: libsqlClient, schema })
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
  interface Container {
    database: LibSQLDatabase<typeof schema>
  }
}

// Module augmentation for Discord
declare module 'discord.js' {
  interface ClientEvents {
    // CustomEvent: {}
  }
}

const client = new BotClient()

// Handle graceful exit
process.on('SIGUSR2', () => {
  // biome-ignore lint/suspicious/noConsole: Process events
  console.log('[nodemon] restarting process, shutting down gracefully')
  // biome-ignore lint/complexity/noVoid: Shutting down
  void client.destroy().then()
  process.exit()
})

process.on('SIGINT', () => {
  // biome-ignore lint/suspicious/noConsole: Process events
  console.log('SIGINT received, shutting down gracefully')
  // biome-ignore lint/complexity/noVoid: Shutting down
  void client.destroy().then()
  process.exit()
})

process.on('SIGTERM', () => {
  // biome-ignore lint/suspicious/noConsole: Process events
  console.log('SIGTERM received, shutting down gracefully')
  // biome-ignore lint/complexity/noVoid: Shutting down
  void client.destroy().then()
  process.exit()
})

client.login(process.env.BOT_TOKEN).catch((e) => {
  // biome-ignore lint/suspicious/noConsole: Catch event
  console.error(e)
})
