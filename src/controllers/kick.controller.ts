import { Message } from "discord.js";

import { Bot } from "../bot";
import { IController } from "../models/controller";

const kickController: IController = {
    description: "Saca al bot del canal de voz.",
    name: "kick",

    execute(message: Message, bot: Bot): void {
        if (!message.member.voiceChannel) {
            message.channel.send("Tenés que estar en mi mismo canal de voz para echarme, salame.");
            return;
        }

        if (bot.channelsPlayingAnthemAt.indexOf(message.member.voiceChannelID) !== -1) {
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
        voiceConnection.disconnect();
    }
};

export = kickController;
