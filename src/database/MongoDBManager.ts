import * as mongoose from "mongoose";

import { logger } from "../logger";

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
}

export const DBManager = new MongoDBManager();
