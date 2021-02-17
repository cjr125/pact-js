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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Matchers = exports.PactWeb = void 0;
// tslint:disable:no-console
/**
 * Pact module for Web use.
 * @module Pact Web
 */
var es6_promise_1 = require("es6-promise");
var interaction_1 = require("./dsl/interaction");
var mockService_1 = require("./dsl/mockService");
var verificationError_1 = require("./errors/verificationError");
es6_promise_1.polyfill();
/**
 * Creates a new {@link PactWeb}.
 * @memberof Pact
 * @name create
 * @param {PactOptions} opts
 * @return {@link PactWeb}
 * @static
 */
var PactWeb = /** @class */ (function () {
    function PactWeb(config) {
        var defaults = {
            cors: false,
            host: "127.0.0.1",
            pactfileWriteMode: "overwrite",
            port: 1234,
            spec: 2,
            ssl: false,
        };
        this.opts = __assign(__assign({}, defaults), config);
        console.info("Setting up Pact using mock service on port: \"" + this.opts.port + "\"");
        this.mockService = new mockService_1.MockService(this.opts.consumer, this.opts.provider, this.opts.port, this.opts.host, this.opts.ssl, this.opts.pactfileWriteMode);
    }
    /**
     * Add an interaction to the {@link MockService}.
     * @memberof PactProvider
     * @instance
     * @param {Interaction} interactionObj
     * @returns {Promise}
     */
    PactWeb.prototype.addInteraction = function (interactionObj) {
        if (interactionObj instanceof interaction_1.Interaction) {
            return this.mockService.addInteraction(interactionObj);
        }
        var interaction = new interaction_1.Interaction();
        if (interactionObj.state) {
            interaction.given(interactionObj.state);
        }
        interaction
            .uponReceiving(interactionObj.uponReceiving)
            .withRequest(interactionObj.withRequest)
            .willRespondWith(interactionObj.willRespondWith);
        return this.mockService.addInteraction(interaction);
    };
    /**
     * Checks with the Mock Service if the expected interactions have been exercised.
     * @memberof PactProvider
     * @instance
     * @returns {Promise}
     */
    PactWeb.prototype.verify = function () {
        var _this = this;
        return this.mockService
            .verify()
            .then(function () { return _this.mockService.removeInteractions(); })
            .catch(function (e) {
            throw new verificationError_1.default(e);
        });
    };
    /**
     * Writes the Pact and clears any interactions left behind.
     * @memberof PactProvider
     * @instance
     * @returns {Promise}
     */
    PactWeb.prototype.finalize = function () {
        var _this = this;
        return this.mockService
            .writePact()
            .then(function () { return _this.mockService.removeInteractions(); });
    };
    /**
     * Writes the Pact file but leave interactions in.
     * @memberof PactProvider
     * @instance
     * @returns {Promise}
     */
    PactWeb.prototype.writePact = function () {
        return this.mockService.writePact();
    };
    /**
     * Clear up any interactions in the Provider Mock Server.
     * @memberof PactProvider
     * @instance
     * @returns {Promise}
     */
    PactWeb.prototype.removeInteractions = function () {
        return this.mockService.removeInteractions();
    };
    return PactWeb;
}());
exports.PactWeb = PactWeb;
/**
 * Exposes {@link Matchers}
 * To avoid polluting the root module's namespace, re-export
 * Matchers as its owns module
 * @memberof Pact
 * @static
 */
var Matchers = require("./dsl/matchers");
exports.Matchers = Matchers;
/**
 * Exposes {@link Interaction}
 * @memberof Pact
 * @static
 */
__exportStar(require("./dsl/interaction"), exports);
/**
 * Exposes {@link MockService}
 * @memberof Pact
 * @static
 */
__exportStar(require("./dsl/mockService"), exports);
/**
 * Exposes {@link GraphQL}
 * @memberof Pact
 * @static
 */
__exportStar(require("./dsl/graphql"), exports);
/**
 * Exposes {@link ApolloGraphQL}
 * @memberof Pact
 * @static
 */
__exportStar(require("./dsl/apolloGraphql"), exports);
//# sourceMappingURL=pact-web.js.map