import { Message } from "discord.js";

import { Bot } from "./bot";
import { CONFIG } from "./config";
import { logger } from "./logger";

const bot = new Bot();

bot.client.on("ready", () => {
    logger.log("info", `Logged in as ${bot.client.user.tag}`);
    bot.scheduleAnthem();
});

bot.client.on("error", (error: Error) => {
    logger.log("error", error.message);
});

bot.client.on("disconnect", (event) => {
    logger.log("info", `Bot disconnected. Code: ${event.code} - Description: ${event.description}`);
    bot.client.login(CONFIG.token);
});

bot.client.on("message", (message: Message) => {
    const response = bot.handleMessage(message);

    if (!response) {
        return;
    }

    response.controller.execute(response.processedMsg, bot, response.msgArgs);
});

bot.client.login(CONFIG.token);
