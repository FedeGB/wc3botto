import { Command } from "./command";
import * as Discord from "discord.js";
import * as Winston from "winston";
import { Manager } from "../manager";

class Help extends Command {
	
    constructor(client: Discord.Client, message: Discord.Message,
     logger: Winston.Logger, manager: Manager) { super(client, message, logger, manager); }

	execute() {
		explain(this.message.channel);
	}
}

const explain = (channel: Discord.TextChannel | Discord.DMChannel | Discord.GroupDMChannel): void => {
    channel.send(
        "// Comandos:\n" +
            "!summon - Meter al bot al canal de voz en el que estás.\n" +
            "!play   - Reproducir música en el canal de voz en el que está el bot (marcha / himno / nunu / vino).\n" +
            "!stop   - Parar la música que está reproduciendo.\n" +
            "!kick   - Sacar al bot del canal de voz.\n" +
            "!help   - Este texto.",
        { code: true }
    );
};

export { Help }