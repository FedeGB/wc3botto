import mongoose from "mongoose";

import { CONFIG } from "../config";
import { logger } from "../logger";
import { AnthemListenerModel, IListeningAnthemUser, IAnthemListener } from "../models/anthem-listener";

class MongoDBManager {
    private db: mongoose.Connection;

    constructor() {
        mongoose.connect(
            `mongodb+srv://${CONFIG.dbUser}:${CONFIG.dbPass}@wc3botto-o9bbu.gcp.mongodb.net/wc3botto`,
            { useNewUrlParser: true }
        );
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

    public saveListeners(listeners: IListeningAnthemUser[]): void {
        if (!listeners || listeners.length === 0) {
            return;
        }

        listeners.forEach((listener) => {
            AnthemListenerModel.updateMany(
                { userId: listener.userId },
                {
                    $inc: listener.quitted ? { quitTimes: 1 } : { timesHeard: listener.pctgListened },
                    $set: { userAlias: listener.userAlias, lastHeard: new Date() }
                },
                { upsert: true, setDefaultsOnInsert: true },
                (err: Error, raw) => {
                    if (err) {
                        logger.error(`There was an error updating the DB. Error: ${err.message}.`);
                    }
                }
            );
        });
    }
}

export const DBManager = new MongoDBManager();
