import { Document, model, Schema } from "mongoose";

export interface IListeningAnthemUser {
    userId: string;
    userAlias: string;
    quitted: boolean;
    listeningStartTime: number;
    totalListenedTime: number;
}

export interface IAnthemListener extends Document {
    userId: string;
    userAlias: string;
    points: number;
    lastHeard: Date;
    quitTimes: number;
}

const anthemListenerSchema = new Schema({
    lastHeard: { type: Date, default: Date.now },
    points: { type: Number, default: 0 },
    quitTimes: { type: Number, default: 0 },
    userAlias: { type: String, required: true },
    userId: { type: String, required: true },
});

export const AnthemListenerModel = model<IAnthemListener>("anthemListener", anthemListenerSchema);
