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
var CIStatusManager = /** @class */ (function () {
    function CIStatusManager() {
        this.providers = new Map();
        this.cache = new Map();
        this.cacheExpiry = 2 * 60 * 1000; // 2 minutes
        this.initializeDefaultProviders();
    }
    /**
     * Initialize default CI providers
     */
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
    /**
     * Add a CI provider
     */
    CIStatusManager.prototype.addProvider = function (provider) {
        this.providers.set(provider.name, provider);
    };
    /**
     * Remove a CI provider
     */
    CIStatusManager.prototype.removeProvider = function (name) {
        this.providers.delete(name);
    };
    /**
     * Get all registered providers
     */
    CIStatusManager.prototype.getProviders = function () {
        return Array.from(this.providers.values());
    };
    /**
     * Fetch CI status for a specific package
     */
    CIStatusManager.prototype.getPackageStatus = function (packageName, providerName) {
        return __awaiter(this, void 0, void 0, function () {
            var cacheKey, cached, builds, provider, _a, _b, provider, providerBuilds, e_1_1, lastBuild, buildHistory, successRate, averageDuration, isHealthy, issues, status_1, error_1;
            var e_1, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        cacheKey = "package-status-".concat(packageName, "-").concat(providerName || 'all');
                        cached = this.getFromCache(cacheKey);
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
                        return [4 /*yield*/, this.fetchBuildsFromProvider(provider, packageName)];
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
                        return [4 /*yield*/, this.fetchBuildsFromProvider(provider, packageName)];
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
                        successRate = this.calculateSuccessRate(builds);
                        averageDuration = this.calculateAverageDuration(builds);
                        isHealthy = this.determinePackageHealth(builds);
                        issues = this.identifyIssues(builds);
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
                        this.setCache(cacheKey, status_1);
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
    /**
     * Get overall monorepo CI status
     */
    CIStatusManager.prototype.getMonorepoStatus = function (packages) {
        return __awaiter(this, void 0, void 0, function () {
            var cacheKey, cached, packageStatuses, allBuilds, totalTests, passedTests, failedTests, packageCoverage, packages_1, packages_1_1, pkg, status_2, e_2_1, totalPackages, healthyPackages, warningPackages, errorPackages, overallHealth, recentBuilds, failedBuilds, coverageValues, overallCoverage, status;
            var e_2, _a;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        cacheKey = 'monorepo-ci-status';
                        cached = this.getFromCache(cacheKey);
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
                        overallHealth = (healthyPackages / totalPackages) * 100;
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
                        this.setCache(cacheKey, status);
                        return [2 /*return*/, status];
                }
            });
        });
    };
    /**
     * Fetch builds from a specific CI provider
     */
    CIStatusManager.prototype.fetchBuildsFromProvider = function (_provider, packageName) {
        return __awaiter(this, void 0, void 0, function () {
            var mockBuilds;
            return __generator(this, function (_a) {
                mockBuilds = [
                    {
                        id: "build-".concat(Date.now(), "-1"),
                        status: 'success',
                        branch: 'main',
                        commit: 'abc1234',
                        commitMessage: "feat: update ".concat(packageName),
                        author: 'developer@example.com',
                        startTime: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
                        endTime: new Date(Date.now() - 1000 * 60 * 25), // 25 minutes ago
                        duration: 5 * 60 * 1000, // 5 minutes
                        url: "https://ci.example.com/builds/build-".concat(Date.now(), "-1"),
                        packageName: packageName,
                        workflowName: 'Build and Test',
                        jobName: 'test',
                        steps: [
                            {
                                name: 'Install dependencies',
                                status: 'success',
                                duration: 30000,
                            },
                            {
                                name: 'Run tests',
                                status: 'success',
                                duration: 120000,
                            },
                            {
                                name: 'Build package',
                                status: 'success',
                                duration: 60000,
                            },
                        ],
                        coverage: {
                            percentage: 85,
                            lines: 1000,
                            functions: 50,
                            branches: 200,
                            statements: 1200,
                        },
                        tests: {
                            total: 150,
                            passed: 145,
                            failed: 0,
                            skipped: 5,
                            duration: 120000,
                            suites: [
                                {
                                    name: 'Unit Tests',
                                    status: 'pass',
                                    tests: [],
                                    duration: 80000,
                                },
                                {
                                    name: 'Integration Tests',
                                    status: 'pass',
                                    tests: [],
                                    duration: 40000,
                                },
                            ],
                        },
                    },
                    {
                        id: "build-".concat(Date.now(), "-2"),
                        status: 'failed',
                        branch: 'feature/new-feature',
                        commit: 'def5678',
                        commitMessage: "fix: resolve issue in ".concat(packageName),
                        author: 'developer@example.com',
                        startTime: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
                        endTime: new Date(Date.now() - 1000 * 60 * 60 * 1.5), // 1.5 hours ago
                        duration: 30 * 60 * 1000, // 30 minutes
                        url: "https://ci.example.com/builds/build-".concat(Date.now(), "-2"),
                        packageName: packageName,
                        workflowName: 'Build and Test',
                        jobName: 'test',
                        steps: [
                            {
                                name: 'Install dependencies',
                                status: 'success',
                                duration: 30000,
                            },
                            {
                                name: 'Run tests',
                                status: 'failed',
                                duration: 120000,
                                error: 'Test suite failed with 3 failing tests',
                            },
                        ],
                        tests: {
                            total: 150,
                            passed: 147,
                            failed: 3,
                            skipped: 0,
                            duration: 120000,
                            suites: [
                                {
                                    name: 'Unit Tests',
                                    status: 'pass',
                                    tests: [],
                                    duration: 80000,
                                },
                                {
                                    name: 'Integration Tests',
                                    status: 'fail',
                                    tests: [],
                                    duration: 40000,
                                },
                            ],
                        },
                    },
                ];
                return [2 /*return*/, mockBuilds];
            });
        });
    };
    /**
     * Calculate success rate from builds
     */
    CIStatusManager.prototype.calculateSuccessRate = function (builds) {
        if (builds.length === 0)
            return 0;
        var successfulBuilds = builds.filter(function (b) { return b.status === 'success'; }).length;
        return (successfulBuilds / builds.length) * 100;
    };
    /**
     * Calculate average build duration
     */
    CIStatusManager.prototype.calculateAverageDuration = function (builds) {
        if (builds.length === 0)
            return 0;
        var completedBuilds = builds.filter(function (b) { return b.duration !== undefined; });
        if (completedBuilds.length === 0)
            return 0;
        var totalDuration = completedBuilds.reduce(function (sum, b) { return sum + (b.duration || 0); }, 0);
        return totalDuration / completedBuilds.length;
    };
    /**
     * Determine if a package is healthy based on CI results
     */
    CIStatusManager.prototype.determinePackageHealth = function (builds) {
        if (builds.length === 0)
            return true;
        var recentBuilds = builds.slice(0, 5); // Last 5 builds
        var successRate = this.calculateSuccessRate(recentBuilds);
        return successRate >= 80; // 80% success rate threshold
    };
    /**
     * Identify issues from build results
     */
    CIStatusManager.prototype.identifyIssues = function (builds) {
        var e_3, _a, e_4, _b;
        var issues = [];
        if (builds.length === 0)
            return issues;
        var recentBuilds = builds.slice(0, 3); // Last 3 builds
        var successRate = this.calculateSuccessRate(recentBuilds);
        if (successRate < 50) {
            issues.push('High failure rate in recent builds');
        }
        var failedBuilds = recentBuilds.filter(function (b) { return b.status === 'failed'; });
        try {
            for (var failedBuilds_1 = __values(failedBuilds), failedBuilds_1_1 = failedBuilds_1.next(); !failedBuilds_1_1.done; failedBuilds_1_1 = failedBuilds_1.next()) {
                var build = failedBuilds_1_1.value;
                var failedSteps = build.steps.filter(function (s) { return s.status === 'failed'; });
                try {
                    for (var failedSteps_1 = (e_4 = void 0, __values(failedSteps)), failedSteps_1_1 = failedSteps_1.next(); !failedSteps_1_1.done; failedSteps_1_1 = failedSteps_1.next()) {
                        var step = failedSteps_1_1.value;
                        if (step.error) {
                            issues.push("Build step '".concat(step.name, "' failed: ").concat(step.error));
                        }
                    }
                }
                catch (e_4_1) { e_4 = { error: e_4_1 }; }
                finally {
                    try {
                        if (failedSteps_1_1 && !failedSteps_1_1.done && (_b = failedSteps_1.return)) _b.call(failedSteps_1);
                    }
                    finally { if (e_4) throw e_4.error; }
                }
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (failedBuilds_1_1 && !failedBuilds_1_1.done && (_a = failedBuilds_1.return)) _a.call(failedBuilds_1);
            }
            finally { if (e_3) throw e_3.error; }
        }
        // Check for long build times
        var avgDuration = this.calculateAverageDuration(recentBuilds);
        if (avgDuration > 10 * 60 * 1000) {
            // 10 minutes
            issues.push('Builds are taking longer than expected');
        }
        return issues;
    };
    /**
     * Get cache value if not expired
     */
    CIStatusManager.prototype.getFromCache = function (key) {
        var cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
            return cached.data;
        }
        return null;
    };
    /**
     * Set cache value with timestamp
     */
    CIStatusManager.prototype.setCache = function (key, data) {
        this.cache.set(key, {
            data: data,
            timestamp: Date.now(),
        });
    };
    /**
     * Clear the cache
     */
    CIStatusManager.prototype.clearCache = function () {
        this.cache.clear();
    };
    /**
     * Get build logs for a specific build
     */
    CIStatusManager.prototype.getBuildLogs = function (buildId, providerName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Mock implementation
                return [2 /*return*/, "Build logs for ".concat(buildId, " from ").concat(providerName, "\n\nStep 1: Install dependencies\n\u2713 Dependencies installed successfully\n\nStep 2: Run tests\n\u2713 All tests passed\n\nStep 3: Build package\n\u2713 Package built successfully")];
            });
        });
    };
    /**
     * Trigger a new build for a package
     */
    CIStatusManager.prototype.triggerBuild = function (packageName_1, providerName_1) {
        return __awaiter(this, arguments, void 0, function (packageName, providerName, branch) {
            var buildId;
            if (branch === void 0) { branch = 'main'; }
            return __generator(this, function (_a) {
                try {
                    buildId = "build-".concat(Date.now(), "-").concat(Math.random().toString(36).substr(2, 9));
                    console.log("Triggering build for ".concat(packageName, " on ").concat(branch, " via ").concat(providerName));
                    return [2 /*return*/, {
                            success: true,
                            buildId: buildId,
                        }];
                }
                catch (error) {
                    return [2 /*return*/, {
                            success: false,
                            error: error instanceof Error ? error.message : 'Unknown error',
                        }];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get build artifacts
     */
    CIStatusManager.prototype.getBuildArtifacts = function (buildId, _providerName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Mock implementation
                return [2 /*return*/, [
                        {
                            name: 'coverage-report.html',
                            type: 'coverage',
                            size: 1024 * 50, // 50KB
                            url: "https://ci.example.com/artifacts/".concat(buildId, "/coverage-report.html"),
                        },
                        {
                            name: 'test-results.xml',
                            type: 'test',
                            size: 1024 * 10, // 10KB
                            url: "https://ci.example.com/artifacts/".concat(buildId, "/test-results.xml"),
                        },
                    ]];
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