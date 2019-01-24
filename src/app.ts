import * as http from "http";

import { Bot } from "./bot";
import { CONFIG } from "./config";

// Hack for now server
http.createServer().listen(3000);

const bot = new Bot();
bot.login(CONFIG.token);
