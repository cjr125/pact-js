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
Object.defineProperty(exports, "__esModule", { value: true });
exports.traceHttpInteractions = exports.setLogLevel = void 0;
var pino = require("pino");
var package_json_1 = require("../../package.json");
var http = require("http");
var DEFAULT_LEVEL = (process.env.LOGLEVEL || "info").toLowerCase();
var createLogger = function (level) {
    if (level === void 0) { level = DEFAULT_LEVEL; }
    return pino({
        level: level.toLowerCase(),
        prettyPrint: {
            messageFormat: "pact@" + package_json_1.version + ": {msg}",
            translateTime: true,
        },
    });
};
var logger = createLogger();
var setLogLevel = function (wantedLevel) {
    if (wantedLevel) {
        logger.level =
            typeof wantedLevel === "string"
                ? wantedLevel.toLowerCase()
                : logger.levels.labels[wantedLevel];
    }
    return logger.levels.values[logger.level];
};
exports.setLogLevel = setLogLevel;
var traceHttpInteractions = function () {
    var originalRequest = http.request;
    http.request = function (options, cb) {
        var requestBodyChunks = [];
        var responseBodyChunks = [];
        var hijackedCalback = function (res) {
            logger.trace("outgoing request", __assign(__assign({}, options), { body: Buffer.concat(requestBodyChunks).toString("utf8") }));
            if (cb) {
                return cb(res);
            }
        };
        var clientRequest = originalRequest(options, hijackedCalback);
        var oldWrite = clientRequest.write.bind(clientRequest);
        clientRequest.write = function (chunk) {
            requestBodyChunks.push(Buffer.from(chunk));
            return oldWrite(chunk);
        };
        clientRequest.on("response", function (incoming) {
            incoming.on("readable", function () {
                responseBodyChunks.push(Buffer.from(incoming.read()));
            });
            incoming.on("end", function () {
                logger.trace({
                    body: Buffer.concat(responseBodyChunks).toString("utf8"),
                    headers: incoming.headers,
                    statusCode: incoming.statusCode,
                });
            });
        });
        return clientRequest;
    };
};
exports.traceHttpInteractions = traceHttpInteractions;
exports.default = logger;
//# sourceMappingURL=logger.js.map