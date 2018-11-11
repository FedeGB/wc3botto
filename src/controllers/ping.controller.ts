import { Message } from "discord.js";

import { IController } from "../models/controller";

const pingController: IController = {
    description: "Just a ping service",
    name: "ping",

    execute(message: Message): void {
        message.channel.send("pong!");
    }
};

export = pingController;
