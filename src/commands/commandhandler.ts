import * as Discord from "discord.js";
import * as Winston from "winston";
import { Command } from "./command";
import { Help } from "./help";
import { Summon } from "./summon";
import { Kick } from "./kick";
import { Play } from "./play";
import { Stop } from "./stop";
import { Manager } from "../manager";

class CommandHandler {

	commands:  { [key: string]: any } = {};

	constructor() {
		this.commands.help = Help;
		this.commands.summon = Summon;
		this.commands.kick = Kick;
		this.commands.play = Play;
		this.commands.stop = Stop;
	}

	getCommand(client: Discord.Client, message: Discord.Message, logger: Winston.Logger, manager: Manager) {
		const msg = message.content.trim();
        const args = msg.substring(1).split(" ");
        const command = args[0];
        var com = null;
		if(command.toLowerCase() in this.commands) {
			com = new this.commands[command.toLowerCase()](client, message, logger, manager);
		} else {
			com = new Command(client, message, logger, manager);
		}
		return com;
	}
	
}

export { CommandHandler };