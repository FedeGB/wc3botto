import { Channel, Client, Collection, Message, TextChannel, VoiceChannel, VoiceConnection } from "discord.js";
import { readdirSync } from "fs";

import { CONFIG } from "./config";
import { DBManager } from "./database/MongoDBManager";
import { playAudioFile } from "./helpers/playAudioFile.helper";
import { logger } from "./logger";
import { IListeningAnthemUser } from "./models/anthem-listener";
import { IController } from "./models/controller";
import { IResponse } from "./models/response";

export class Bot {
    private readonly ANTHEM_DURATION = 3 * 60 + 58; // Anthem duration in secs

    private client: Client;
    private controllers: Collection<string, IController>;
    private channelsPlayingAnthemAt: string[] = [];
    private anthemListeners: Collection<string, IListeningAnthemUser[]> = new Collection();

    constructor() {
        this.client = new Client();

        this.client.on("ready", () => {
            logger.log("info", `Logged in as ${this.client.user.tag}`);
            this.scheduleAnthem();
        });

        this.client.on("error", (error: Error) => {
            logger.log("error", error.message);
        });

        this.client.on("disconnect", (event) => {
            logger.log("info", `Bot disconnected. Code: ${event.code} - Description: ${event.description}`);
            this.client.login(CONFIG.token);
        });

        this.client.on("message", (message: Message) => {
            const response = this.handleMessage(message);

            if (!response) {
                return;
            }

            response.controller.execute(response.processedMsg, this, response.msgArgs);
        });

        this.client.on("voiceStateUpdate", (oldMember, newMember) => {
            if (this.channelsPlayingAnthemAt.length === 0) {
                return;
            }

            if (
                // If user exited channel or deafened himself
                (oldMember.voiceChannel &&
                    this.channelsPlayingAnthemAt.indexOf(oldMember.voiceChannel.id) !== -1 &&
                    (!newMember.voiceChannel ||
                        this.channelsPlayingAnthemAt.indexOf(newMember.voiceChannel.id) === -1)) ||
                (!oldMember.selfDeaf && newMember.selfDeaf)
            ) {
                const listeners = this.anthemListeners.get(oldMember.voiceChannel.id);
                if (listeners) {
                    const listener = listeners.find((value) => value.userId === oldMember.id);
                    if (listener) {
                        const now = new Date();
                        listener.quitted = true;
                        listener.pctgListened +=
                            (now.getUTCMinutes() * 60 + now.getUTCSeconds() - listener.listeningStartTime) /
                            this.ANTHEM_DURATION;
                    }
                }
            } else if (
                // If user has entered the channel while anthem is playing, or undefeanded himself
                ((!oldMember.voiceChannel || this.channelsPlayingAnthemAt.indexOf(oldMember.voiceChannel.id) === -1) &&
                newMember.voiceChannel &&
                this.channelsPlayingAnthemAt.indexOf(newMember.voiceChannel.id) !== -1) ||
                (oldMember.selfDeaf && !newMember.selfDeaf)
            ) {
                const listeners = this.anthemListeners.get(newMember.voiceChannel.id);
                if (listeners) {
                    let listener = listeners.find((elem) => elem.userId === newMember.id);
                    const now = new Date();
                    const secondsSinceStart = now.getUTCMinutes() * 60 + now.getUTCSeconds();
                    if (!listener) {
                        listener = {
                            listeningStartTime: secondsSinceStart,
                            pctgListened: 0,
                            quitted: false,
                            userAlias: newMember.nickname,
                            userId: newMember.id,
                        };
                        listeners.push(listener);
                    }
                    listener.quitted = false;
                    listener.listeningStartTime = secondsSinceStart;
                }
            }
        });

        this.controllers = initControllers();
    }

    public login(token: string): void {
        this.client.login(token);
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
                            const anthemListeners: IListeningAnthemUser[] = new Array(voiceChannel.members.size);

                            voiceChannel.members.forEach((user) => {
                                if (!user.selfDeaf) {
                                    const listener: IListeningAnthemUser = {
                                        listeningStartTime: 0,
                                        pctgListened: 0,
                                        quitted: false,
                                        userAlias: user.nickname,
                                        userId: user.id
                                    };
                                    anthemListeners.push(listener);
                                }
                            });
                            this.anthemListeners.set(voiceChannel.id, anthemListeners);

                            this.channelsPlayingAnthemAt.push(voiceChannel.id);
                            const dispatcher = playAudioFile(voiceConnection, "himno-arg.mp3", 0.25);
                            this.client.setTimeout(() => {
                                // Stop playing and disconnect from voice channel
                                dispatcher.end();
                                voiceConnection.disconnect();

                                // Remove from list of channels where anthem is being played
                                this.channelsPlayingAnthemAt.splice(
                                    this.channelsPlayingAnthemAt.indexOf(voiceChannel.id),
                                    1
                                );

                                // Handle anthem listeners
                                anthemListeners.forEach((listener) => {
                                    listener.pctgListened +=
                                        (this.ANTHEM_DURATION - listener.listeningStartTime) / this.ANTHEM_DURATION;
                                });

                                DBManager.saveListeners(anthemListeners);
                            }, this.ANTHEM_DURATION * 1000);
                        });
                    } else {
                        this.client.channels.forEach((chan: Channel) => {
                            if (chan.id === "428386268817260545") {
                                // canal-para-putos
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
