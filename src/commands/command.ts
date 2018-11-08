import * as Discord from "discord.js";
import * as Winston from "winston";
import { Manager } from "../manager";

class Command {
	
	client: Discord.Client;
	message: Discord.Message;
	logger: Winston.Logger;
	manager: Manager;

	constructor(discordClient : Discord.Client, discordMessage : Discord.Message,
	 winstonLogger: Winston.Logger, management: Manager) {
		this.client = discordClient;
		this.message = discordMessage;
		this.logger = winstonLogger;
		this.manager = management;
	}

	execute() {
		this.message.channel.send(
	        "¿Y qué pasará con los comandos que se han llevado?",
	        { code: true }
    	);
	}
}

export { Command };