"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const configController_1 = require("../controllers/configController");
const configRouter = express_1.default.Router();
configRouter
    .route('/files')
    .get(configController_1.getConfigurationFiles);
configRouter
    .route('/files/:id')
    .put(configController_1.updateConfigFile);
exports.default = configRouter;
