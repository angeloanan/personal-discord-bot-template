import 'dotenv/config'

import { container, LogLevel, SapphireClient } from '@sapphire/framework'
// import { PrismaClient } from '@prisma/client'

export class BotClient extends SapphireClient {
  public constructor() {
    super({
      intents: ['GUILDS', 'GUILD_MESSAGES'],
      allowedMentions: { parse: ['roles', 'users'] },
      presence: {
        afk: true,
        status: 'idle',
        activities: [
          {
            name: 'for the ready signal',
            type: 'WATCHING'
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
  interface ClientEvents {
    // TODO: Augment custom events here
    CustomEvent: {
      param: unknown
    }
  }
}

const client = new BotClient()

// Handle graceful exit
process.on('SIGUSR2', () => {
  console.log('[nodemon] restarting process, shutting down gracefully')
  client.destroy()
})

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully')
  client.destroy()
})

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  client.destroy()
})

client.login(process.env.BOT_TOKEN).catch((e) => console.error(e))
