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
exports.PerfMonCommandSet = void 0;
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_2 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_3 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_4 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_5 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_6 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_7 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_8 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_9 = require("pip-services3-commons-nodex");
const CounterV1Schema_1 = require("../data/version1/CounterV1Schema");
class PerfMonCommandSet extends pip_services3_commons_nodex_1.CommandSet {
    constructor(logic) {
        super();
        this._logic = logic;
        this.addCommand(this.makeReadCountersCommand());
        this.addCommand(this.makeWriteCounterCommand());
        this.addCommand(this.makeWriteCountersCommand());
        this.addCommand(this.makeClearCommand());
    }
    makeReadCountersCommand() {
        return new pip_services3_commons_nodex_2.Command("read_counters", new pip_services3_commons_nodex_5.ObjectSchema(true)
            .withOptionalProperty('fitler', new pip_services3_commons_nodex_7.FilterParamsSchema())
            .withOptionalProperty('paging', new pip_services3_commons_nodex_8.PagingParamsSchema()), (correlationId, args) => __awaiter(this, void 0, void 0, function* () {
            let filter = pip_services3_commons_nodex_3.FilterParams.fromValue(args.get("filter"));
            let paging = pip_services3_commons_nodex_4.PagingParams.fromValue(args.get("paging"));
            return yield this._logic.readCounters(correlationId, filter, paging);
        }));
    }
    makeWriteCounterCommand() {
        return new pip_services3_commons_nodex_2.Command("write_counter", new pip_services3_commons_nodex_5.ObjectSchema(true)
            .withRequiredProperty('counter', new CounterV1Schema_1.CounterV1Schema()), (correlationId, args) => __awaiter(this, void 0, void 0, function* () {
            let counter = args.get("counter");
            counter.time = pip_services3_commons_nodex_9.DateTimeConverter.toNullableDateTime(counter.time);
            return yield this._logic.writeCounter(correlationId, counter);
        }));
    }
    makeWriteCountersCommand() {
        return new pip_services3_commons_nodex_2.Command("write_counters", new pip_services3_commons_nodex_5.ObjectSchema(true)
            .withRequiredProperty('counters', new pip_services3_commons_nodex_6.ArraySchema(new CounterV1Schema_1.CounterV1Schema())), (correlationId, args) => __awaiter(this, void 0, void 0, function* () {
            let counters = args.get("counters");
            for (let counter of counters)
                counter.time = pip_services3_commons_nodex_9.DateTimeConverter.toNullableDateTime(counter.time);
            return yield this._logic.writeCounters(correlationId, counters);
        }));
    }
    makeClearCommand() {
        return new pip_services3_commons_nodex_2.Command("clear", null, (correlationId, args) => __awaiter(this, void 0, void 0, function* () {
            return yield this._logic.clear(correlationId);
        }));
    }
}
exports.PerfMonCommandSet = PerfMonCommandSet;
//# sourceMappingURL=PerfMonCommandSet.js.map