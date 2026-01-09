"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const packageController_1 = require("../controllers/packageController");
const packageRouter = express_1.default.Router();
packageRouter
    .route('/refresh')
    .get(packageController_1.refreshPackages);
packageRouter
    .route('/update-config')
    .put(packageController_1.updatePackageConfig);
packageRouter
    .route('/:name')
    .get(packageController_1.getPackageDetail);
packageRouter
    .route('/')
    .get(packageController_1.getPackages);
exports.default = packageRouter;
