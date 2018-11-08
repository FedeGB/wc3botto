import { Command } from "./command";
import * as Discord from "discord.js";
import * as Winston from "winston";
import { Manager } from "../manager";

class Summon extends Command {
	
    constructor(client: Discord.Client, message: Discord.Message,
     logger: Winston.Logger, manager: Manager) { super(client, message, logger, manager); }

	execute() {
		if (this.message.member.voiceChannel) {
            if (this.message.member.voiceChannel.members.has(this.client.user.id)) {
                this.message.channel.send("Pero ya estoy metido en el canal de voz...");
                return;
            }
            this.message.member.voiceChannel.join().then((connection) =>
                connection.on("error", (error: Error) => {
                    this.logger.log("error", error.message);
                })
            );
        } else {
            this.message.channel.send("Tenés que estar en un canal de voz para llamarme, salame.");
        }
	}
}

export { Summon }