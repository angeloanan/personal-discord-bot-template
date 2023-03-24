import 'dotenv/config'

import { container, LogLevel, SapphireClient } from '@sapphire/framework'
import { ActivityType } from 'discord.js'
// import { PrismaClient } from '@prisma/client'

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
    // container.logger.info('Connecting to database...')
    // container.database = new PrismaClient()
    // await container.database.$connect()
    // container.logger.info(`Connected to database.`)
    container.logger.info(`Bot logging in...`)
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
  // Remove this when using custom container
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Container {
    // database: PrismaClient
  }
}

// Module augmentation for Discord
declare module 'discord.js' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface ClientEvents {
    // TODO: Augment custom events here
    // CustomEvent: {}
  }
}

const client = new BotClient()

// Handle graceful exit
process.on('SIGUSR2', async () => {
  console.log('[nodemon] restarting process, shutting down gracefully')
  await client.destroy()
  process.exit()
})

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully')
  await client.destroy()
  process.exit()
})

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully')
  await client.destroy()
  process.exit()
})

client.login(process.env.BOT_TOKEN).catch((e) => console.error(e))
