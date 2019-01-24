import { Message, TextChannel } from "discord.js";

import { Bot } from "../bot";
import { IController } from "../models/controller";

const pingController: IController = {
    description: "Get anthem stats",
    name: "stats",

    execute(message: Message, bot: Bot): void {
        bot.showStatsAtChannel(message.channel as TextChannel);
    }
};

export = pingController;
