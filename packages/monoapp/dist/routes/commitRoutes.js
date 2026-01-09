"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const commitController_1 = require("../controllers/commitController");
const commitRouter = express_1.default.Router();
commitRouter
    .route('/:packagePath')
    .get(commitController_1.getCommitsByPath);
exports.default = commitRouter;
