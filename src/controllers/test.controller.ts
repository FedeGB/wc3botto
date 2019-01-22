import { Message } from "discord.js";

import { Bot } from "../bot";
import { playAudioFile } from "../helpers/playAudioFile.helper";
import { IController } from "../models/controller";

const testController: IController = {
    description: "Para testear el bot",
    name: "test",

    execute(message: Message, bot: Bot, args: string[]): void {
        /* if (!message.member.voiceChannel || !bot.client.voiceConnections.get(message.guild.id)) {
            message.channel.send("Tanto vos como yo tenemos que estar en un canal de voz, querido...");
            return;
        }

        if (bot.isPlayingAnthemAtChannel(message.member.voiceChannelID)) {
            message.reply(
                "No se puede reproducir otra cosa hasta que no termine el gran himno de todos los argentinos."
            );
            return;
        }

        const voiceConnection = bot.client.voiceConnections.get(message.guild.id);
        if (voiceConnection) {
            switch (args[0]) {
                case "marcha":
                    playAudioFile(voiceConnection, "marcha.mp3", 0.5);
                    break;

                case "himno":
                    playAudioFile(voiceConnection, "himno-arg.mp3", 0.5);
                    break;

                case "vino":
                    playAudioFile(voiceConnection, "vino.mp3", 1);
                    break;

                case "nunu":
                    playAudioFile(voiceConnection, "tren-cielo.mp3", 0.4);
                    break;

                case "cabral":
                    playAudioFile(voiceConnection, "cabral.mp3", 0.5);
                    break;

                case "bad":
                    playAudioFile(voiceConnection, "bad.mp3", 0.5);
                    break;

                default:
                    break;
            }
        } */
    }
};

export = testController;
