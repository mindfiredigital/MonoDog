"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ciStatusManager = exports.CIStatusManager = void 0;
exports.getPackageCIStatus = getPackageCIStatus;
exports.getMonorepoCIStatus = getMonorepoCIStatus;
exports.triggerPackageBuild = triggerPackageBuild;
var cache_1 = require("./cache");
var metrics_1 = require("./metrics");
var mock_1 = require("./api/mock");
var CIStatusManager = /** @class */ (function () {
    function CIStatusManager() {
        this.providers = new Map();
        this.cache = new cache_1.CacheManager();
        this.initializeDefaultProviders();
    }
    CIStatusManager.prototype.initializeDefaultProviders = function () {
        // GitHub Actions
        this.addProvider({
            name: 'GitHub Actions',
            type: 'github',
            baseUrl: 'https://api.github.com',
        });
        // GitLab CI
        this.addProvider({
            name: 'GitLab CI',
            type: 'gitlab',
            baseUrl: 'https://gitlab.com/api/v4',
        });
        // CircleCI
        this.addProvider({
            name: 'CircleCI',
            type: 'circleci',
            baseUrl: 'https://circleci.com/api/v2',
        });
    };
    CIStatusManager.prototype.addProvider = function (provider) {
        this.providers.set(provider.name, provider);
    };
    CIStatusManager.prototype.removeProvider = function (name) {
        this.providers.delete(name);
    };
    CIStatusManager.prototype.getProviders = function () {
        return Array.from(this.providers.values());
    };
    CIStatusManager.prototype.getPackageStatus = function (packageName, providerName) {
        return __awaiter(this, void 0, void 0, function () {
            var cacheKey, cached, builds, provider, _a, _b, provider, providerBuilds, e_1_1, lastBuild, buildHistory, successRate, averageDuration, isHealthy, issues, status_1, error_1;
            var e_1, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        cacheKey = "package-status-".concat(packageName, "-").concat(providerName || 'all');
                        cached = this.cache.getFromCache(cacheKey);
                        if (cached) {
                            return [2 /*return*/, cached];
                        }
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 12, , 13]);
                        builds = [];
                        if (!providerName) return [3 /*break*/, 4];
                        provider = this.providers.get(providerName);
                        if (!provider) return [3 /*break*/, 3];
                        return [4 /*yield*/, (0, mock_1.fetchBuildsFromProvider)(provider, packageName)];
                    case 2:
                        builds = _d.sent();
                        _d.label = 3;
                    case 3: return [3 /*break*/, 11];
                    case 4:
                        _d.trys.push([4, 9, 10, 11]);
                        _a = __values(this.providers.values()), _b = _a.next();
                        _d.label = 5;
                    case 5:
                        if (!!_b.done) return [3 /*break*/, 8];
                        provider = _b.value;
                        return [4 /*yield*/, (0, mock_1.fetchBuildsFromProvider)(provider, packageName)];
                    case 6:
                        providerBuilds = _d.sent();
                        builds.push.apply(builds, __spreadArray([], __read(providerBuilds), false));
                        _d.label = 7;
                    case 7:
                        _b = _a.next();
                        return [3 /*break*/, 5];
                    case 8: return [3 /*break*/, 11];
                    case 9:
                        e_1_1 = _d.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 11];
                    case 10:
                        try {
                            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7 /*endfinally*/];
                    case 11:
                        if (builds.length === 0) {
                            return [2 /*return*/, null];
                        }
                        // Sort builds by start time (newest first)
                        builds.sort(function (a, b) { return b.startTime.getTime() - a.startTime.getTime(); });
                        lastBuild = builds[0];
                        buildHistory = builds.slice(0, 10);
                        successRate = (0, metrics_1.calculateSuccessRate)(builds);
                        averageDuration = (0, metrics_1.calculateAverageDuration)(builds);
                        isHealthy = (0, metrics_1.determinePackageHealth)(builds);
                        issues = (0, metrics_1.identifyIssues)(builds);
                        status_1 = {
                            packageName: packageName,
                            lastBuild: lastBuild,
                            buildHistory: buildHistory,
                            successRate: successRate,
                            averageDuration: averageDuration,
                            lastCommit: lastBuild.commit,
                            lastCommitDate: lastBuild.startTime,
                            branch: lastBuild.branch,
                            isHealthy: isHealthy,
                            issues: issues,
                        };
                        this.cache.setCache(cacheKey, status_1);
                        return [2 /*return*/, status_1];
                    case 12:
                        error_1 = _d.sent();
                        console.error("Error fetching CI status for ".concat(packageName, ":"), error_1);
                        return [2 /*return*/, null];
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    CIStatusManager.prototype.getMonorepoStatus = function (packages) {
        return __awaiter(this, void 0, void 0, function () {
            var cacheKey, cached, packageStatuses, allBuilds, totalTests, passedTests, failedTests, packageCoverage, packages_1, packages_1_1, pkg, status_2, e_2_1, totalPackages, healthyPackages, warningPackages, errorPackages, overallHealth, recentBuilds, failedBuilds, coverageValues, overallCoverage, status;
            var e_2, _a;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        cacheKey = 'monorepo-ci-status';
                        cached = this.cache.getFromCache(cacheKey);
                        if (cached) {
                            return [2 /*return*/, cached];
                        }
                        packageStatuses = [];
                        allBuilds = [];
                        totalTests = 0;
                        passedTests = 0;
                        failedTests = 0;
                        packageCoverage = {};
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 6, 7, 8]);
                        packages_1 = __values(packages), packages_1_1 = packages_1.next();
                        _d.label = 2;
                    case 2:
                        if (!!packages_1_1.done) return [3 /*break*/, 5];
                        pkg = packages_1_1.value;
                        return [4 /*yield*/, this.getPackageStatus(pkg.name)];
                    case 3:
                        status_2 = _d.sent();
                        if (status_2) {
                            packageStatuses.push(status_2);
                            allBuilds.push.apply(allBuilds, __spreadArray([], __read(status_2.buildHistory), false));
                            // Aggregate test results
                            if ((_b = status_2.lastBuild) === null || _b === void 0 ? void 0 : _b.tests) {
                                totalTests += status_2.lastBuild.tests.total;
                                passedTests += status_2.lastBuild.tests.passed;
                                failedTests += status_2.lastBuild.tests.failed;
                            }
                            // Aggregate coverage
                            if ((_c = status_2.lastBuild) === null || _c === void 0 ? void 0 : _c.coverage) {
                                packageCoverage[pkg.name] = status_2.lastBuild.coverage.percentage;
                            }
                        }
                        _d.label = 4;
                    case 4:
                        packages_1_1 = packages_1.next();
                        return [3 /*break*/, 2];
                    case 5: return [3 /*break*/, 8];
                    case 6:
                        e_2_1 = _d.sent();
                        e_2 = { error: e_2_1 };
                        return [3 /*break*/, 8];
                    case 7:
                        try {
                            if (packages_1_1 && !packages_1_1.done && (_a = packages_1.return)) _a.call(packages_1);
                        }
                        finally { if (e_2) throw e_2.error; }
                        return [7 /*endfinally*/];
                    case 8:
                        totalPackages = packages.length;
                        healthyPackages = packageStatuses.filter(function (s) { return s.isHealthy; }).length;
                        warningPackages = packageStatuses.filter(function (s) { return !s.isHealthy && s.issues.length < 3; }).length;
                        errorPackages = packageStatuses.filter(function (s) { return !s.isHealthy && s.issues.length >= 3; }).length;
                        overallHealth = totalPackages > 0 ? (healthyPackages / totalPackages) * 100 : 0;
                        // Sort builds by time
                        allBuilds.sort(function (a, b) { return b.startTime.getTime() - a.startTime.getTime(); });
                        recentBuilds = allBuilds.slice(0, 20);
                        failedBuilds = allBuilds.filter(function (b) { return b.status === 'failed'; });
                        coverageValues = Object.values(packageCoverage);
                        overallCoverage = coverageValues.length > 0
                            ? coverageValues.reduce(function (sum, val) { return sum + val; }, 0) /
                                coverageValues.length
                            : 0;
                        status = {
                            totalPackages: totalPackages,
                            healthyPackages: healthyPackages,
                            warningPackages: warningPackages,
                            errorPackages: errorPackages,
                            overallHealth: overallHealth,
                            packages: packageStatuses,
                            recentBuilds: recentBuilds,
                            failedBuilds: failedBuilds,
                            coverage: {
                                overall: overallCoverage,
                                packages: packageCoverage,
                            },
                            tests: {
                                total: totalTests,
                                passed: passedTests,
                                failed: failedTests,
                                successRate: totalTests > 0 ? (passedTests / totalTests) * 100 : 0,
                            },
                        };
                        this.cache.setCache(cacheKey, status);
                        return [2 /*return*/, status];
                }
            });
        });
    };
    CIStatusManager.prototype.getBuildLogs = function (buildId, providerName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, (0, mock_1.getBuildLogs)(buildId, providerName)];
            });
        });
    };
    CIStatusManager.prototype.triggerBuild = function (packageName_1, providerName_1) {
        return __awaiter(this, arguments, void 0, function (packageName, providerName, branch) {
            if (branch === void 0) { branch = 'main'; }
            return __generator(this, function (_a) {
                return [2 /*return*/, (0, mock_1.triggerBuild)(packageName, providerName, branch)];
            });
        });
    };
    CIStatusManager.prototype.getBuildArtifacts = function (buildId, providerName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, (0, mock_1.getBuildArtifacts)(buildId, providerName)];
            });
        });
    };
    return CIStatusManager;
}());
exports.CIStatusManager = CIStatusManager;
// Export default instance
exports.ciStatusManager = new CIStatusManager();
// Export convenience functions
function getPackageCIStatus(packageName) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, exports.ciStatusManager.getPackageStatus(packageName)];
        });
    });
}
function getMonorepoCIStatus(packages) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, exports.ciStatusManager.getMonorepoStatus(packages)];
        });
    });
}
function triggerPackageBuild(packageName, providerName, branch) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, exports.ciStatusManager.triggerBuild(packageName, providerName, branch)];
        });
    });
}
//# sourceMappingURL=index.js.map