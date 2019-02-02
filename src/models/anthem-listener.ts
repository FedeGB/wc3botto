import { Document, model, Schema } from "mongoose";

export interface IListeningAnthemUser {
    userId: string;
    userAlias: string;
    quitted: boolean;
    listeningStartTime: Date;
    pctgListened: number;
    listeningFromStart: boolean;
}

export interface IAnthemListener extends Document {
    userId: string;
    userAlias: string;
    timesHeard: number;
    lastHeard: Date;
    quitTimes: number;
    guildId: string;
}

const anthemListenerSchema = new Schema({
    guildId: { type: String },
    lastHeard: { type: Date, default: Date.now },
    quitTimes: { type: Number, default: 0 },
    timesHeard: { type: Number, default: 0 },
    userAlias: { type: String, required: true },
    userId: { type: String, required: true },
});

export const AnthemListenerModel = model<IAnthemListener>("anthemListener", anthemListenerSchema, "anthem-listeners");
