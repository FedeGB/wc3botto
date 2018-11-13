import { Message } from "discord.js";
import { Bot } from "../bot";

export interface IController {
    readonly name: string;
    readonly description: string;

    execute(message: Message, bot: Bot, args?: string[]): void;
}
