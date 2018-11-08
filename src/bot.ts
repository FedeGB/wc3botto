import * as Discord from "discord.js";
import * as Winston from "winston";
import { CONFIG } from "./config";
import { CommandHandler } from "./commands/commandhandler";
import { Manager } from "./manager";

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
const manager = new Manager(logger);

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

const handler = new CommandHandler();
client.on("message", (message: Discord.Message) => {
    const msg = message.content.trim();
    if (msg[0] === "!") {
        const commandExec = handler.getCommand(client, message, logger, manager);
        commandExec.execute();
    } else if (msg.toLowerCase().includes("punto")) {
        message.reply("*puto");
    }
});

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
                        manager.addChannelIdAnthem(voiceChannel.id);
                        const dispatcher = manager.playAudioFile(voiceConnection, "himno-arg.mp3", 0.25);
                        client.setTimeout(() => {
                            dispatcher.end();
                            voiceConnection.disconnect();
                            manager.removeChannelIdAnthem(voiceChannel.id);
                        }, (3 * 60 + 58) * 1000);
                    });
                }
            }
        });
        scheduleAnthem();
    }, argTomorrow.valueOf() - argNow.valueOf());
};

client.login(CONFIG.token);
