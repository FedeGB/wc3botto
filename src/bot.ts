import { Channel, Client, Collection, Message, TextChannel, VoiceChannel, VoiceConnection } from "discord.js";
import { readdirSync } from "fs";

import { CONFIG } from "./config";
import { playAudioFile } from "./helpers/playAudioFile.helper";
import { logger } from "./logger";
import { IController } from "./models/controller";
import { IResponse } from "./models/response";

export class Bot {
    public client: Client;
    public controllers: Collection<string, IController>;
    public channelsPlayingAnthemAt: string[] = [];

    constructor() {
        this.client = new Client();
        this.controllers = initControllers();
    }

    public scheduleAnthem(): void {
        const argOffset = -3;
        const argNow = new Date(Date.now() + argOffset * 3600 * 1000); // UTC time moved to GMT-0300 Arg Standard Time
        const argTomorrow = new Date(argNow);
        argTomorrow.setUTCDate(argNow.getUTCDate() + 1);
        argTomorrow.setUTCHours(0, 0, 0, 0);

        this.client.setTimeout(() => {
            this.client.channels.forEach((channel: Channel) => {
                if (channel.type === "voice") {
                    const voiceChannel: VoiceChannel = channel as VoiceChannel;
                    if (voiceChannel.members.size > 0) {
                        voiceChannel.join().then((voiceConnection: VoiceConnection) => {
                            this.channelsPlayingAnthemAt.push(voiceChannel.id);
                            const dispatcher = playAudioFile(voiceConnection, "himno-arg.mp3", 0.25);
                            this.client.setTimeout(() => {
                                dispatcher.end();
                                voiceConnection.disconnect();
                                this.channelsPlayingAnthemAt.splice(
                                    this.channelsPlayingAnthemAt.indexOf(voiceChannel.id),
                                    1
                                );
                            }, (3 * 60 + 58) * 1000);
                        });
                    } else {
                        this.client.channels.forEach((chan: Channel) => {
                            if (chan.id === "428386268817260545") {     // canal-para-putos
                                const ch = chan as TextChannel;
                                ch.send(
                                    "Debería darles vergüenza no estar presentes para entonar las estrofas de nuestro gran himno nacional."
                                );
                            }
                        });
                    }
                }
            });
            this.scheduleAnthem();
        }, argTomorrow.valueOf() - argNow.valueOf());
    }

    public handleMessage(message: Message): IResponse | null {
        if (message.author.bot) {
            return null;
        }

        if (!message.content.startsWith(CONFIG.cmdPrefix)) {
            const lowerCaseMsg = message.content.toLowerCase();
            if (lowerCaseMsg.includes("punto")) {
                message.reply("*puto");
            } else if (lowerCaseMsg.includes("verga")) {
                message.channel.send("Jejeje, dijo verga.");
            } else if (lowerCaseMsg.includes("pito")) {
                message.channel.send("Jejeje, dijo pito.");
            }

            return null;
        }

        const args = message.content.slice(CONFIG.cmdPrefix.length).split(" ");
        let controllerName = args.shift();
        if (!controllerName) {
            return null;
        }

        controllerName = controllerName.toLowerCase();

        if (CONFIG.env !== "production") {
            if (!controllerName.endsWith("-dev")) {
                return null;
            }

            controllerName = controllerName.replace("-dev", "");
        }

        const controllerToUse = this.controllers.get(controllerName);

        if (!controllerToUse) {
            return null;
        }

        const response: IResponse = {
            controller: controllerToUse,
            msgArgs: args,
            processedMsg: message
        };

        return response;
    }
}

const initControllers = () => {
    const controllerFiles = readdirSync(__dirname + "/controllers");
    const controllers = new Collection<string, IController>();

    for (const file of controllerFiles) {
        if (file.endsWith(".map") || file === "controller.js") {
            continue;
        }
        const filePath = `./controllers/${file}`.replace(".js", "");
        import(filePath)
            .then((controller: IController) => {
                controllers.set(controller.name, controller);
            })
            .catch((reason) => {
                logger.log("error", `Failed to import file: ${reason}`);
            });
    }

    return controllers;
};
