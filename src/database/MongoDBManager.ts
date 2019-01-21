import * as mongoose from "mongoose";

import { logger } from "../logger";
import { IListeningAnthemUser, IAnthemListener, AnthemListenerModel } from '../models/anthem-listener';

class MongoDBManager {
    private db: mongoose.Connection;

    constructor() {
        mongoose.connect(`mongodb+srv://jereaa:hvpYbutlJEhOxiiQ@wc3botto-o9bbu.gcp.mongodb.net/wc3botto`);
        this.db = mongoose.connection;

        this.db.on("error", (error: Error) => {
            logger.error(`Connection error: ${error.message}`);
        });

        this.db.once("open", () => {
            logger.info("Connected to DB");
        });
    }

    public saveListeners(listeners: IListeningAnthemUser[]): void {
        if (!listeners || listeners.length === 0) {
            return;
        }

        listeners.forEach((listener) => {
            AnthemListenerModel.update({ userId: listener.userId }, {
                $inc: listener.quitted ? { quitted: 1 } : { timesHeard: listener.pctgListened },
                $set: { userAlias: listener.userAlias },
            }, { upsert: true, setDefaultsOnInsert: true }, (err: Error, raw) => {
                if (err) {
                    logger.error(`There was an error updating the DB. Error: ${err.message}`);
                }
            });

            /* AnthemListenerModel.findOne({ userId: listener.userId }, (err: Error, anthemListener: IAnthemListener) => {
                if (err) {
                    logger.error(`There was a problem finding the anthem listener. Error:  ${err.message}`);
                    return;
                }

                if (anthemListener) {
                    anthemListener.userAlias = listener.userAlias;
                    anthemListener.timesHeard += listener.pctgListened;
                }
            }) */
        });
    }
}

export const DBManager = new MongoDBManager();
