"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const package_controller_1 = require("../controllers/package-controller");
const packageRouter = express_1.default.Router();
packageRouter
    .route('/refresh')
    .get(package_controller_1.refreshPackages);
packageRouter
    .route('/update-config')
    .put(package_controller_1.updatePackageConfig);
packageRouter
    .route('/:name')
    .get(package_controller_1.getPackageDetail);
packageRouter
    .route('/')
    .get(package_controller_1.getPackages);
exports.default = packageRouter;
