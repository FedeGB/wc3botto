import { Channel, Client, Collection, Guild, Message, TextChannel, VoiceChannel, VoiceConnection } from "discord.js";
import { readdirSync } from "fs";

import { CONFIG } from "./config";
import { DBManager } from "./database/MongoDBManager";
import { playAudioFile } from "./helpers/playAudioFile.helper";
import { logger } from "./logger";
import { IListeningAnthemUser } from "./models/anthem-listener";
import { IController } from "./models/controller";
import { IResponse } from "./models/response";

export class Bot {
    public readonly client: Client;

    private readonly ANTHEM_DURATION = 3 * 60 + 58; // Anthem duration in secs

    private controllers: Collection<string, IController>;
    private guildsPlayingAnthemAt: string[] = [];
    private anthemListeners: Collection<string, IListeningAnthemUser[]> = new Collection();

    constructor() {
        this.client = new Client();

        this.client.on("ready", () => {
            logger.info(`Logged in as ${this.client.user.tag}`);
            this.scheduleAnthem();
        });

        this.client.on("error", (error: Error) => {
            logger.error(error.message);
        });

        this.client.on("disconnect", (event) => {
            logger.info(`Bot disconnected. Code: ${event.code} - Description: ${event.description}`);
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
            if (this.guildsPlayingAnthemAt.length === 0) {
                return;
            }

            const voiceConnection = this.client.voiceConnections.get(newMember.guild.id);
            if (!voiceConnection) {
                return;
            }

            const botVoiceChannel = voiceConnection.channel;
            if (
                // If user exited channel or deafened himself
                (oldMember.voiceChannelID === botVoiceChannel.id && newMember.voiceChannelID !== botVoiceChannel.id) ||
                (!oldMember.selfDeaf && newMember.selfDeaf)
            ) {
                const listeners = this.anthemListeners.get(oldMember.guild.id);
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
                (oldMember.voiceChannelID !== botVoiceChannel.id && newMember.voiceChannelID === botVoiceChannel.id) ||
                (oldMember.selfDeaf && !newMember.selfDeaf)
            ) {
                const listeners = this.anthemListeners.get(newMember.guild.id);
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
                            userId: newMember.id
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

    public isPlayingAnthemAtGuild(guildId: string): boolean {
        return this.guildsPlayingAnthemAt.indexOf(guildId) !== -1;
    }

    public scheduleAnthem(): void {
        const argOffset = -3;
        const argNow = new Date(Date.now() + argOffset * 3600 * 1000); // UTC time moved to GMT-0300 Arg Standard Time
        const argTomorrow = new Date(argNow);
        argTomorrow.setUTCDate(argNow.getUTCDate() + 1);
        argTomorrow.setUTCHours(0, 0, 0, 0);

        this.client.setTimeout(() => {
            this.playAnthem();
            this.scheduleAnthem();
        }, argTomorrow.valueOf() - argNow.valueOf());
    }

    public playAnthem(): void {
        this.client.guilds.forEach((guild: Guild) => {
            this.playAnthemAtGuild(guild);
        });
    }

    public playAnthemAtGuild(guild: Guild): void {
        const voiceChannel = guild.channels.find((channel) => channel.type === "voice") as VoiceChannel;
        if (voiceChannel && voiceChannel.members.size > 0) {
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
                this.anthemListeners.set(guild.id, anthemListeners);

                this.guildsPlayingAnthemAt.push(guild.id);
                const dispatcher = playAudioFile(voiceConnection, "himno-arg.mp3", 0.25);
                this.client.setTimeout(() => {
                    this.stopAnthem(guild.id);
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

    public stopAnthem(guildId: string): void {
        const voiceConnection = this.client.voiceConnections.get(guildId);
        const dispatcher = voiceConnection ? voiceConnection.dispatcher : undefined;

        if (!voiceConnection) {
            return;
        }

        // Stop playing and disconnect from voice channel
        if (dispatcher) {
            dispatcher.end();
        }
        voiceConnection.disconnect();

        // Remove from list of channels where anthem is being played
        this.guildsPlayingAnthemAt.splice(
            this.guildsPlayingAnthemAt.indexOf(guildId),
            1
        );

        // Handle anthem listeners
        const anthemListeners = this.anthemListeners.get(guildId);
        if (!anthemListeners) {
            return;
        }

        anthemListeners.forEach((listener) => {
            listener.pctgListened +=
                (this.ANTHEM_DURATION - listener.listeningStartTime) / this.ANTHEM_DURATION;
        });

        DBManager.saveListeners(anthemListeners);
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
        if (
            file.endsWith(".map") ||
            file === "controller.js" ||
            (CONFIG.env !== "production" && file === "test.controller.js")
        ) {
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
