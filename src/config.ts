const isDev = process.env.NODE_ENV === "production" ? false : true;

const testDBURI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@wc3botto-test-t1ggl.mongodb.net/wc3botto-test`;
const prodDBURI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@wc3botto-o9bbu.gcp.mongodb.net/wc3botto`;

export const CONFIG = {
    cmdPrefix: "!",
    dbUri: isDev ? testDBURI : prodDBURI,
    env: process.env.NODE_ENV || "development",
    token: process.env.TOKEN || "",
};
