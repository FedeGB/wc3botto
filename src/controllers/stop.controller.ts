import { Message } from "discord.js";

import { Bot } from "../bot";
import { IController } from "../models/controller";

const stopController: IController = {
    description: "Para lo que esté transmitiendo el bot.",
    name: "stop",

    execute(message: Message, bot: Bot): void {
        if (!message.member.voiceChannel) {
            message.channel.send("No estás en ningún canal de voz.");
            return;
        }

        if (bot.isPlayingAnthemAtGuild(message.member.guild.id)) {
            message.reply("¿Cómo osas intentar detener el himno de nuestra querida nación? Maldito vende patria.");
            return;
        }

        const voiceConnection = bot.client.voiceConnections.get(message.guild.id);
        if (!voiceConnection) {
            message.channel.send("Pero no estoy metido en el canal de voz...");
            return;
        }

        if (voiceConnection.dispatcher) {
            voiceConnection.dispatcher.end();
        }
    }
};

export = stopController;
