import { Command } from "./command";
import * as Discord from "discord.js";
import * as Winston from "winston";
import { Manager } from "../manager";

class Play extends Command {
	
    constructor(client: Discord.Client, message: Discord.Message,
     logger: Winston.Logger, manager: Manager) { super(client, message, logger, manager); }

	execute() {
        const msg = this.message.content.trim();
        const args = msg.substring(1).split(" ");
        if (this.message.member.voiceChannel && args.length > 1) {
            if (this.manager.hasChannelIdAnthem(this.message.member.voiceChannelID)) {
                this.message.channel.send(
                    "No se puede reproducir otra cosa hasta que no termine el gran himno de todos los argentinos."
                );
                return;
            }
            const voiceConnection = this.client.voiceConnections.get(this.message.guild.id);
            if (voiceConnection) {
                switch (args[1]) {
                    case "marcha":
                        this.manager.playAudioFile(voiceConnection, "marcha.mp3", 0.5);
                        break;

                    case "himno":
                        this.manager.playAudioFile(voiceConnection, "himno-arg.mp3", 0.5);
                        break;

                    case "vino":
                        this.manager.playAudioFile(voiceConnection, "vino.mp3", 1);
                        break;

                    case "nunu":
                        this.manager.playAudioFile(voiceConnection, "tren-cielo.mp3", 0.4);
                        break;

                    default:
                        break;
                }
            }
        }
	}
}

export { Play }