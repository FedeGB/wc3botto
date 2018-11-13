import * as Winston from "winston";

// Configure Logger
const myFormat = Winston.format.printf((info) => {
    return `${info.timestamp} ${info.level}: ${info.message}`;
});

export const logger = Winston.createLogger({
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
