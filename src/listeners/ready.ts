import { Listener } from '@sapphire/framework'
import { ActivityType, type Client, OAuth2Scopes } from 'discord.js'

export class ReadyListener extends Listener {
	public constructor(context: Listener.LoaderContext, options: Listener.Options) {
		super(context, {
			...options,
			event: 'ready'
		})
	}

	async run(client: Client<true>): Promise<void> {
		const { username, id } = client.user
		this.container.logger.info(`Successfully logged in as ${username} (${id})`)

		const inviteLink = client.generateInvite({
			scopes: [OAuth2Scopes.Bot, OAuth2Scopes.ApplicationsCommands],
			permissions: ['Administrator']
		})
		this.container.logger.info(`Invite link: ${inviteLink}`)

		client.user.setPresence({
			status: 'online',
			afk: false,
			activities: [
				{
					name: 'chat',
					type: ActivityType.Watching
				}
			]
		})
	}
}
