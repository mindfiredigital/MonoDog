"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_loader_1 = require("./config-loader");
function generateUrl() {
    const DATABASE_URL = `${config_loader_1.appConfig.database.path}`;
    process.env.DATABASE_URL = DATABASE_URL;
    process.stdout.write(DATABASE_URL);
}
generateUrl();
