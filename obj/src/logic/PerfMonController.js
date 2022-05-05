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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerfMonController = void 0;
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_2 = require("pip-services3-commons-nodex");
const PerfMonCommandSet_1 = require("./PerfMonCommandSet");
class PerfMonController {
    constructor() {
        this._expireCleanupTimeout = 60; // 60 min
        this._expireTimeout = 3; // 3 days
        this._interval = null;
        this._dependencyResolver = new pip_services3_commons_nodex_2.DependencyResolver();
        this._dependencyResolver.put('persistence', new pip_services3_commons_nodex_1.Descriptor('service-perfmon', 'persistence', '*', '*', '*'));
    }
    asyncInterval(callback, ms, triesLeft = 5) {
        return new Promise((resolve, reject) => {
            const interval = setInterval(() => __awaiter(this, void 0, void 0, function* () {
                if (yield callback()) {
                    resolve(null);
                    clearInterval(interval);
                }
                else if (triesLeft <= 1) {
                    reject();
                    clearInterval(interval);
                }
                triesLeft--;
            }), ms);
        });
    }
    getCommandSet() {
        if (this._commandSet == null)
            this._commandSet = new PerfMonCommandSet_1.PerfMonCommandSet(this);
        return this._commandSet;
    }
    configure(config) {
        this._dependencyResolver.configure(config);
        this._expireCleanupTimeout = config.getAsIntegerWithDefault('options.expire_cleanup_timeout', this._expireCleanupTimeout);
        this._expireTimeout = config.getAsIntegerWithDefault('options._expire_counter_timeout', this._expireTimeout);
    }
    setReferences(references) {
        this._dependencyResolver.setReferences(references);
        this._persistence = this._dependencyResolver.getOneRequired('persistence');
    }
    isOpen() {
        return this._interval != null;
    }
    open(correlationId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._interval != null) {
                clearInterval(this._interval);
            }
            this._interval = setInterval(() => __awaiter(this, void 0, void 0, function* () {
                yield this.deleteExpired(correlationId);
            }), 1000 * 60 * this._expireCleanupTimeout);
        });
    }
    close(correlationId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._interval != null) {
                clearTimeout(this._interval);
                this._interval = null;
            }
        });
    }
    writeCounter(correlationId, counter) {
        return __awaiter(this, void 0, void 0, function* () {
            counter.id = counter.name + "_" + counter.source;
            counter.time = counter.time || new Date();
            return yield this._persistence.addOne(correlationId, counter);
        });
    }
    writeCounters(correlationId, counters) {
        return __awaiter(this, void 0, void 0, function* () {
            if (counters == null || counters.length == 0) {
                return;
            }
            for (let counter of counters) {
                counter.id = counter.name + "_" + counter.source;
                counter.time = counter.time || new Date();
            }
            return yield this._persistence.addBatch(correlationId, counters);
        });
    }
    readCounters(correlationId, filter, paging) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._persistence.getPageByFilter(correlationId, filter, paging);
        });
    }
    clear(correlationId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._persistence.clear(correlationId);
        });
    }
    deleteExpired(correlationId) {
        return __awaiter(this, void 0, void 0, function* () {
            let now = new Date().getTime();
            let expireTime = new Date(now - this._expireTimeout * 24 * 3600000);
            return yield this._persistence.deleteExpired(correlationId, expireTime);
        });
    }
}
exports.PerfMonController = PerfMonController;
//# sourceMappingURL=PerfMonController.js.map