"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const config_controller_1 = require("../controllers/config-controller");
const configRouter = express_1.default.Router();
configRouter
    .route('/files')
    .get(config_controller_1.getConfigurationFiles);
configRouter
    .route('/files/:id')
    .put(config_controller_1.updateConfigFile);
exports.default = configRouter;
