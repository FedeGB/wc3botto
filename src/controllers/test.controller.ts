import { Message } from "discord.js";

import { Bot } from "../bot";
import { IController } from "../models/controller";
import { logger } from '../logger';

const testController: IController = {
    description: "Para testear el bot",
    name: "test",

    execute(message: Message, bot: Bot, args: string[]): void {
        switch (args[0]) {
            case "play-anthem":
                logger.info("Trying to play anthem...");
                bot.playAnthemAtGuild(message.guild);
                break;

            case "stop-anthem":
                bot.stopAnthem(message.guild.id);
                break;
        }
    }
};

export = testController;
