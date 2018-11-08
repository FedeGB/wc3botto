import * as Discord from "discord.js";
import * as Winston from "winston";

class Manager {

	playingAnthemChannelsId: string[] = [];
	logger: Winston.Logger;

	constructor(winstonLogger: Winston.Logger) {
		this.logger = winstonLogger;
	}

	addChannelIdAnthem(id: string) {
		this.playingAnthemChannelsId.push(id);
	}

	removeChannelIdAnthem(id: string) {
		this.playingAnthemChannelsId.splice(this.playingAnthemChannelsId.indexOf(id), 1);
	}

	hasChannelIdAnthem(id: string) {
		return this.playingAnthemChannelsId.indexOf(id) !== -1;
	}

	playAudioFile(voiceConnection: Discord.VoiceConnection, 
		fileName: string, playVolume: number = 1): Discord.StreamDispatcher {
	    const filePath = __dirname + "/../assets/audio/" + fileName;
	    const dispatcher = voiceConnection.playFile(filePath, {
	        volume: playVolume
	    });

	    dispatcher.on("error", (error: Error) => {
	        this.logger.log("error", error.message);
	    });

	    return dispatcher;
	}

}

export { Manager }