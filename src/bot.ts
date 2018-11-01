import * as Discord from "discord.js";
import * as Winston from "winston";
import { CONFIG } from "./config";

// Configure Logger
const myFormat = Winston.format.printf((info) => {
    return `${info.timestamp} ${info.level}: ${info.message}`;
});
const logger = Winston.createLogger({
    format: Winston.format.combine(Winston.format.timestamp(), myFormat),
    transports: [
        // - Write to all logs with level `info` and below to `combined.log`
        // - Write all logs error (and below) to `error.log`.
        new Winston.transports.File({
            filename: "./logs/error.log",
            level: "error"
        }),
        new Winston.transports.File({ filename: "./logs/combined.log" })
    ]
});

// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
if (process.env.NODE_ENV !== "production") {
    logger.add(
        new Winston.transports.Console({
            format: Winston.format.colorize()
        })
    );
}

const client = new Discord.Client();
const playingAnthemChannelsId: string[] = [];

client.on("ready", () => {
    logger.log("info", `Logged in as ${client.user.tag}`);
    scheduleAnthem();
});

client.on("error", (error: Error) => {
    logger.log("error", error.message);
});

client.on("disconnect", (event) => {
    logger.log("info", `Bot disconnected. Code: ${event.code} - Description: ${event.description}`);
    client.login(CONFIG.token);
});

client.on("message", (message: Discord.Message) => {
    const msg = message.content.trim();
    if (msg[0] === "!") {
        const args = msg.substring(1).split(" ");
        const cmd = args[0];

        switch (cmd) {
            case "ping":
                message.channel.send("pong");
                break;

            case "help":
                explain(message.channel);
                break;

            case "summon":
                if (message.member.voiceChannel) {
                    if (message.member.voiceChannel.members.has(client.user.id)) {
                        message.channel.send("Pero ya estoy metido en el canal de voz...");
                        return;
                    }
                    message.member.voiceChannel.join().then((connection) =>
                        connection.on("error", (error: Error) => {
                            logger.log("error", error.message);
                        })
                    );
                } else {
                    message.channel.send("Tenés que estar en un canal de voz para llamarme, salame.");
                }
                break;

            case "kick":
                if (message.member.voiceChannel) {
                    if (!message.member.voiceChannel.members.has(client.user.id)) {
                        message.channel.send("Pero no estoy metido en el canal de voz...");
                        return;
                    } else if (playingAnthemChannelsId.indexOf(message.member.voiceChannelID) !== -1) {
                        message.reply("¿Cómo osas intentar detener el himno de nuestra querida nación? Maldito vende patria.");
                        return;
                    }
                    const voiceConnection = client.voiceConnections.get(message.guild.id);
                    if (voiceConnection) {
                        if (voiceConnection.dispatcher) {
                            voiceConnection.dispatcher.end();
                        }
                        voiceConnection.disconnect();
                    }
                } else {
                    message.channel.send("Tenés que estar en mi mismo canal de voz para echarme, salame.");
                }
                break;

            case "play":
                if (message.member.voiceChannel && args.length > 1) {
                    if (playingAnthemChannelsId.indexOf(message.member.voiceChannelID) !== -1) {
                        message.channel.send(
                            "No se puede reproducir otra cosa hasta que no termine el gran himno de todos los argentinos."
                        );
                        return;
                    }
                    const voiceConnection = client.voiceConnections.get(message.guild.id);
                    if (voiceConnection) {
                        switch (args[1]) {
                            case "marcha":
                                playAudioFile(voiceConnection, "marcha.mp3", 0.5);
                                break;

                            case "himno":
                                playAudioFile(voiceConnection, "himno-arg.mp3", 0.5);
                                break;

                            default:
                                break;
                        }
                    }
                }
                break;

            case "stop":
                if (message.member.voiceChannel) {
                    if (playingAnthemChannelsId.indexOf(message.member.voiceChannelID) !== -1) {
                        message.reply("¿Cómo osas intentar detener el himno de nuestra querida nación? Maldito vende patria.");
                        return;
                    }
                    const voiceConnection = client.voiceConnections.get(message.guild.id);
                    if (voiceConnection) {
                        voiceConnection.dispatcher.end();
                    }
                }
                break;

            default:
                break;
        }
    } else if (msg.toLowerCase().includes("punto")) {
        message.reply("*puto");
    }
});

const explain = (channel: Discord.TextChannel | Discord.DMChannel | Discord.GroupDMChannel): void => {
    channel.send(
        "// Comandos:\n" +
            "!summon - Meter al bot al canal de voz en el que estás.\n" +
            "!play   - Reproducir música en el canal de voz en el que está el bot (marcha / himno).\n" +
            "!stop   - Parar la música que está reproduciendo.\n" +
            "!kick   - Sacar al bot del canal de voz.\n" +
            "!help   - Este texto.",
        { code: true }
    );
};

const playAudioFile = (
    voiceConnection: Discord.VoiceConnection,
    fileName: string,
    playVolume: number = 1
): Discord.StreamDispatcher => {
    const filePath = __dirname + "/../assets/audio/" + fileName;
    const dispatcher = voiceConnection.playFile(filePath, {
        volume: playVolume
    });

    dispatcher.on("error", (error: Error) => {
        logger.log("error", error.message);
    });

    return dispatcher;
};

const scheduleAnthem = () => {
    const argOffset = -3;
    const argNow = new Date(Date.now() + argOffset * 3600 * 1000); // UTC time moved to GMT-0300 Arg Standard Time
    const argTomorrow = new Date(argNow);
    argTomorrow.setUTCDate(argNow.getUTCDate() + 1);
    argTomorrow.setUTCHours(0, 0, 0, 0);

    client.setTimeout(() => {
        client.channels.forEach((channel: Discord.Channel) => {
            if (channel.type === "voice") {
                const voiceChannel: Discord.VoiceChannel = channel as Discord.VoiceChannel;
                if (voiceChannel.members.size > 0) {
                    voiceChannel.join().then((voiceConnection: Discord.VoiceConnection) => {
                        playingAnthemChannelsId.push(voiceChannel.id);
                        const dispatcher = playAudioFile(voiceConnection, "himno-arg.mp3", 0.25);
                        client.setTimeout(() => {
                            dispatcher.end();
                            voiceConnection.disconnect();
                            playingAnthemChannelsId.splice(playingAnthemChannelsId.indexOf(voiceChannel.id), 1);
                        }, (3 * 60 + 58) * 1000);
                    });
                }
            }
        });
        scheduleAnthem();
    }, argTomorrow.valueOf() - argNow.valueOf());
};

client.login(CONFIG.token);
