import { Message } from "discord.js";

import { Bot } from "../bot";
import { logger } from "../logger";
import { IController } from "../models/controller";

const summonController: IController = {
    description: "Mete al bot en el canal de voz.",
    name: "summon",

    execute(message: Message, bot: Bot): void {
        if (!message.member.voiceChannel) {
            message.channel.send("Tenés que estar en un canal de voz para llamarme, salame.");
            return;
        }

        if (message.member.voiceChannel.members.has(bot.client.user.id)) {
            message.channel.send("Pero ya estoy metido en el canal de voz...");
            return;
        }

        message.member.voiceChannel.join().then((connection) => {
            connection.on("error", (error: Error) => {
                logger.log("error", error.message);
            });
        });
    }
};

export = summonController;
