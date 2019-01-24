import mongoose from "mongoose";

import { CONFIG } from "../config";
import { logger } from "../logger";
import { AnthemListenerModel, IAnthemListener, IListeningAnthemUser } from "../models/anthem-listener";

class MongoDBManager {
    private db: mongoose.Connection;

    constructor() {
        mongoose.connect(CONFIG.dbUri, { useNewUrlParser: true });
        this.db = mongoose.connection;

        this.db.on("error", (error: Error) => {
            logger.error(`Connection error: ${error.message}`);
        });

        this.db.once("open", () => {
            logger.info("Connected to DB");
        });
    }

    public getListeners(callback: (listeners: IAnthemListener[] | null) => void): void {
        AnthemListenerModel.find((err: Error, listeners: IAnthemListener[]) => {
            if (err) {
                logger.error(`There was an error retrieving data from the server: Error: ${err.message}`);
                return callback(null);
            }
            callback(listeners);
        });
    }

    public saveListeners(listeners: IListeningAnthemUser[], callback?: () => void): void {
        if (!listeners || listeners.length === 0) {
            return;
        }

        let updatedUsers = 0;
        listeners.forEach((listener) => {
            AnthemListenerModel.updateOne(
                { userId: listener.userId },
                {
                    $inc: listener.quitted ? { quitTimes: 1 } : { timesHeard: listener.pctgListened },
                    $set: { userAlias: listener.userAlias, lastHeard: new Date() }
                },
                { upsert: true, setDefaultsOnInsert: true },
                (err: Error, raw) => {
                    updatedUsers++;
                    if (err) {
                        logger.error(`There was an error updating the DB. Error: ${err.message}.`);
                        return;
                    }

                    if (callback && updatedUsers === listeners.length) {
                        callback();
                    }
                }
            );
        });
    }
}

export const DBManager = new MongoDBManager();
