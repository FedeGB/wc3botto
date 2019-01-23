export const CONFIG = {
    cmdPrefix: "!",
    dbPass: process.env.DB_PASS,
    dbUser: process.env.DB_USER,
    env: process.env.NODE_ENV || "development",
    token: process.env.TOKEN || "",
};
