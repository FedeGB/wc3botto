import { Message } from "discord.js";

import { DBManager } from "../database/MongoDBManager";
import { IController } from "../models/controller";

const pingController: IController = {
    description: "Get anthem stats",
    name: "stats",

    execute(message: Message): void {
        DBManager.getListeners((listeners) => {
            if (!listeners) {
                return;
            }

            // listeners.sort()
        });
    }
};

export = pingController;
