import { StreamDispatcher, VoiceConnection } from "discord.js";

import { logger } from "../logger";

export const playAudioFile = (
    voiceConnection: VoiceConnection,
    filename: string,
    playVolume: number = 1
): StreamDispatcher => {
    const filePath = `${__dirname}/../../assets/audio/${filename}`;
    const dispatcher = voiceConnection.playFile(filePath, {
        volume: playVolume
    });

    dispatcher.on("error", (error: Error) => {
        logger.log("error", error.message);
    });

    return dispatcher;
};
