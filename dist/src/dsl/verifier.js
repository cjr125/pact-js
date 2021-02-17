"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Verifier = void 0;
/**
 * Provider Verifier service
 * @module ProviderVerifier
 */
var pact_node_1 = require("@pact-foundation/pact-node");
var utils_1 = require("../common/utils");
var pact_node_2 = require("@pact-foundation/pact-node");
var lodash_1 = require("lodash");
var express = require("express");
var http = require("http");
var logger_1 = require("../common/logger");
var configurationError_1 = require("../errors/configurationError");
var net_1 = require("../common/net");
var url = require("url");
var HttpProxy = require("http-proxy");
var bodyParser = require("body-parser");
var Verifier = /** @class */ (function () {
    function Verifier(config) {
        this.address = "http://localhost";
        this.stateSetupPath = "/_pactSetup";
        this.deprecatedFields = ["providerStatesSetupUrl"];
        if (config) {
            this.setConfig(config);
        }
    }
    /**
     * Verify a HTTP Provider
     *
     * @param config
     */
    Verifier.prototype.verifyProvider = function (config) {
        logger_1.default.info("Verifying provider");
        // Backwards compatibility
        if (config) {
            logger_1.default.warn("Passing options to verifyProvider() wil be deprecated in future versions, please provide to Verifier constructor instead");
            this.setConfig(config);
        }
        if (lodash_1.isEmpty(this.config)) {
            return Promise.reject(new configurationError_1.default("No configuration provided to verifier"));
        }
        // Start the verification CLI proxy server
        var app = this.createProxy();
        var server = this.startProxy(app);
        // Run the verification once the proxy server is available
        return this.waitForServerReady(server)
            .then(this.runProviderVerification())
            .then(function (result) {
            server.close();
            return result;
        })
            .catch(function (e) {
            server.close();
            throw e;
        });
    };
    // Run the Verification CLI process
    Verifier.prototype.runProviderVerification = function () {
        var _this = this;
        return function (server) {
            var port = server.address().port;
            var opts = __assign(__assign({ providerStatesSetupUrl: _this.address + ":" + port + _this.stateSetupPath }, lodash_1.omit(_this.config, "handlers")), { providerBaseUrl: _this.address + ":" + port });
            return utils_1.qToPromise(pact_node_1.default.verifyPacts(opts));
        };
    };
    // Listens for the server start event
    // Converts event Emitter to a Promise
    Verifier.prototype.waitForServerReady = function (server) {
        return new Promise(function (resolve, reject) {
            server.on("listening", function () { return resolve(server); });
            server.on("error", function () {
                return reject(new Error("Unable to start verification proxy server"));
            });
        });
    };
    // Get the Proxy we'll pass to the CLI for verification
    Verifier.prototype.startProxy = function (app) {
        return http.createServer(app).listen();
    };
    // Get the Express app that will run on the HTTP Proxy
    Verifier.prototype.createProxy = function () {
        var _this = this;
        var app = express();
        var proxy = new HttpProxy();
        app.use(this.stateSetupPath, bodyParser.json());
        app.use(this.stateSetupPath, bodyParser.urlencoded({ extended: true }));
        this.registerBeforeHook(app);
        this.registerAfterHook(app);
        // Trace req/res logging
        if (this.config.logLevel === "debug") {
            logger_1.default.info("debug request/response logging enabled");
            app.use(this.createRequestTracer());
            app.use(this.createResponseTracer());
        }
        // Allow for request filtering
        if (this.config.requestFilter !== undefined) {
            app.use(this.config.requestFilter);
        }
        // Setup provider state handler
        app.post(this.stateSetupPath, this.createProxyStateHandler());
        // Proxy server will respond to Verifier process
        app.all("/*", function (req, res) {
            logger_1.default.debug("Proxing", req.path);
            proxy.web(req, res, {
                changeOrigin: _this.config.changeOrigin === true,
                secure: _this.config.validateSSL === true,
                target: _this.config.providerBaseUrl,
            });
        });
        return app;
    };
    Verifier.prototype.createProxyStateHandler = function () {
        var _this = this;
        return function (req, res) {
            var message = req.body;
            return _this.setupStates(message)
                .then(function () { return res.sendStatus(200); })
                .catch(function (e) { return res.status(500).send(e); });
        };
    };
    Verifier.prototype.registerBeforeHook = function (app) {
        var _this = this;
        app.use(function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.config.beforeEach !== undefined)) return [3 /*break*/, 4];
                        logger_1.default.trace("registered 'beforeEach' hook");
                        if (!(req.path === this.stateSetupPath)) return [3 /*break*/, 4];
                        logger_1.default.debug("executing 'beforeEach' hook");
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.config.beforeEach()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        logger_1.default.error("error executing 'beforeEach' hook: ", e_1);
                        next(new Error("error executing 'beforeEach' hook: " + e_1));
                        return [3 /*break*/, 4];
                    case 4:
                        next();
                        return [2 /*return*/];
                }
            });
        }); });
    };
    Verifier.prototype.registerAfterHook = function (app) {
        var _this = this;
        app.use(function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.config.afterEach !== undefined)) return [3 /*break*/, 5];
                        logger_1.default.trace("registered 'afterEach' hook");
                        next();
                        if (!(req.path !== this.stateSetupPath)) return [3 /*break*/, 4];
                        logger_1.default.debug("executing 'afterEach' hook");
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.config.afterEach()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_2 = _a.sent();
                        logger_1.default.error("error executing 'afterEach' hook: ", e_2);
                        next(new Error("error executing 'afterEach' hook: " + e_2));
                        return [3 /*break*/, 4];
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        next();
                        _a.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        }); });
    };
    Verifier.prototype.createRequestTracer = function () {
        return function (req, _, next) {
            logger_1.default.trace("incoming request", removeEmptyRequestProperties(req));
            next();
        };
    };
    Verifier.prototype.createResponseTracer = function () {
        return function (_, res, next) {
            var _a = [res.write, res.end], oldWrite = _a[0], oldEnd = _a[1];
            var chunks = [];
            res.write = function (chunk) {
                chunks.push(Buffer.from(chunk));
                return oldWrite.apply(res, [chunk]);
            };
            res.end = function (chunk) {
                if (chunk) {
                    chunks.push(Buffer.from(chunk));
                }
                var body = Buffer.concat(chunks).toString("utf8");
                logger_1.default.trace("outgoing response", removeEmptyResponseProperties(body, res));
                oldEnd.apply(res, [chunk]);
            };
            if (typeof next === "function") {
                next();
            }
        };
    };
    // Lookup the handler based on the description, or get the default handler
    Verifier.prototype.setupStates = function (descriptor) {
        var _this = this;
        var promises = new Array();
        if (descriptor.states) {
            descriptor.states.forEach(function (state) {
                var handler = _this.config.stateHandlers
                    ? _this.config.stateHandlers[state]
                    : null;
                if (handler) {
                    promises.push(handler());
                }
                else {
                    logger_1.default.warn("No state handler found for \"" + state + "\", ignoring");
                }
            });
        }
        return Promise.all(promises);
    };
    Verifier.prototype.setConfig = function (config) {
        var _this = this;
        this.config = config;
        if (this.config.logLevel && !lodash_1.isEmpty(this.config.logLevel)) {
            pact_node_2.default.logLevel(this.config.logLevel);
            logger_1.setLogLevel(this.config.logLevel);
        }
        this.deprecatedFields.forEach(function (f) {
            if (_this.config[f]) {
                logger_1.default.warn(f + " is deprecated, and will be removed in future versions");
            }
        });
        if (this.config.validateSSL === undefined) {
            this.config.validateSSL = true;
        }
        if (this.config.changeOrigin === undefined) {
            this.config.changeOrigin = false;
            if (!this.isLocalVerification()) {
                this.config.changeOrigin = true;
                logger_1.default.debug("non-local provider address " + this.config.providerBaseUrl + " detected, setting 'changeOrigin' to 'true'. This property can be overridden.");
            }
        }
    };
    Verifier.prototype.isLocalVerification = function () {
        var u = new url.URL(this.config.providerBaseUrl);
        return (net_1.localAddresses.includes(u.host) || net_1.localAddresses.includes(u.hostname));
    };
    return Verifier;
}());
exports.Verifier = Verifier;
var removeEmptyRequestProperties = function (req) {
    return lodash_1.pickBy({
        body: req.body,
        headers: req.headers,
        method: req.method,
        path: req.path,
    }, lodash_1.identity);
};
var removeEmptyResponseProperties = function (body, res) {
    return lodash_1.pickBy({
        body: body,
        headers: lodash_1.reduce(res.getHeaders(), function (acc, val, index) {
            acc[index] = val;
            return acc;
        }, {}),
        status: res.statusCode,
    }, lodash_1.identity);
};
//# sourceMappingURL=verifier.js.map