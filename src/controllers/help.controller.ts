import { Message } from "discord.js";

import { IController } from "../models/controller";

const helpController: IController = {
    description: "Despliega lista de comandos del bot.",
    name: "help",

    execute(message: Message): void {
        message.channel.send(
            "Lista de comandos:\n\n" +
                "!summon         - Meter al bot al canal de voz en el que estás.\n" +
                "!play [audio]   - Reproducir música en el canal de voz en el que está el bot.\n" +
                "\t[audio] = himno | marcha | nunu | vino | cabral\n" +
                "!stop           - Parar la música que está reproduciendo.\n" +
                "!kick           - Sacar al bot del canal de voz.\n" +
                "!help           - Este texto.",
            { code: true }
        );
    }
};

export = helpController;
