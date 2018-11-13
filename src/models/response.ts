import { Message } from "discord.js";

import { IController } from "./controller";

export interface IResponse {
    controller: IController;
    msgArgs: string[];
    processedMsg: Message;
}
