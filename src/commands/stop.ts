import { Command } from "./command";
import * as Discord from "discord.js";
import * as Winston from "winston";
import { Manager } from "../manager";

class Stop extends Command {
	
    constructor(client: Discord.Client, message: Discord.Message,
     logger: Winston.Logger, manager: Manager) { super(client, message, logger, manager); }

	execute() {
        if (this.message.member.voiceChannel) {
            if (this.manager.hasChannelIdAnthem(this.message.member.voiceChannelID)) {
                this.message.reply("¿Cómo osas intentar detener el himno de nuestra querida nación? Maldito vende patria.");
                return;
            }
            const voiceConnection = this.client.voiceConnections.get(this.message.guild.id);
            if (voiceConnection) {
                voiceConnection.dispatcher.end();
            }
        }
	}
}

export { Stop }