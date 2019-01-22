import { Message } from "discord.js";

import { Bot } from "../bot";
import { playAudioFile } from "../helpers/playAudioFile.helper";
import { IController } from "../models/controller";

const testController: IController = {
    description: "Para testear el bot",
    name: "test",

    execute(message: Message, bot: Bot, args: string[]): void {
        if (!message.member.voiceChannel || !bot.client.voiceConnections.get(message.guild.id)) {
            message.channel.send("Tanto vos como yo tenemos que estar en un canal de voz, querido...");
            return;
        }

        const voiceConnection = bot.client.voiceConnections.get(message.guild.id);
        if (voiceConnection) {
            switch (args[0]) {
                case "play-anthem":
                    bot.playAnthemAtGuild(message.guild);
                    break;

                case "stop-anthem":
                    bot.stopAnthem(message.guild.id);
                    break;
            }
        }
    }
};

export = testController;
