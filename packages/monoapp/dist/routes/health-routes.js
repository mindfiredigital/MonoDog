"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const health_controller_1 = require("../controllers/health-controller");
const healthRouter = express_1.default.Router();
healthRouter
    .route('/refresh')
    .get(health_controller_1.refreshHealth);
healthRouter
    .route('/packages')
    .get(health_controller_1.getPackagesHealth);
exports.default = healthRouter;
