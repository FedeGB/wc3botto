import { Document, model, Schema } from "mongoose";

export interface IListeningAnthemUser {
    userId: string;
    userAlias: string;
    quitted: boolean;
    listeningStartTime: number;
    pctgListened: number;
}

export interface IAnthemListener extends Document {
    userId: string;
    userAlias: string;
    timesHeard: number;
    lastHeard: Date;
    quitTimes: number;
}

const anthemListenerSchema = new Schema({
    lastHeard: { type: Date, default: Date.now },
    quitTimes: { type: Number, default: 0 },
    timesHeard: { type: Number, default: 0 },
    userAlias: { type: String, required: true },
    userId: { type: String, required: true },
});

anthemListenerSchema.pre("save", (next) => {
    this.lastHeard = new Date();
});

anthemListenerSchema.pre("update", (next) => {
    this.lastHeard = new Date();
});

export const AnthemListenerModel = model<IAnthemListener>("anthemListener", anthemListenerSchema);
