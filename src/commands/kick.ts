import { Command } from "./command";
import * as Discord from "discord.js";
import * as Winston from "winston";
import { Manager } from "../manager";

class Kick extends Command {
	
    constructor(client: Discord.Client, message: Discord.Message,
     logger: Winston.Logger, manager: Manager) { super(client, message, logger, manager); }

	execute() {
        if (this.message.member.voiceChannel) {
            if (!this.message.member.voiceChannel.members.has(this.client.user.id)) {
                this.message.channel.send("Pero no estoy metido en el canal de voz...");
                return;
            } else if (this.manager.hasChannelIdAnthem(this.message.member.voiceChannelID)) {
                this.message.reply("¿Cómo osas intentar detener el himno de nuestra querida nación? Maldito vende patria.");
                return;
            }
            const voiceConnection = this.client.voiceConnections.get(this.message.guild.id);
            if (voiceConnection) {
                if (voiceConnection.dispatcher) {
                    voiceConnection.dispatcher.end();
                }
                voiceConnection.disconnect();
            }
        } else {
            this.message.channel.send("Tenés que estar en mi mismo canal de voz para echarme, salame.");
        }
	}
}

export { Kick }