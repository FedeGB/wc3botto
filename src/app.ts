import { Bot } from "./bot";
import { CONFIG } from "./config";

const bot = new Bot();
bot.login(CONFIG.token);
