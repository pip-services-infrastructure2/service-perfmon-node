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
exports.PerfMonMemoryPersistence = void 0;
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_2 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_3 = require("pip-services3-commons-nodex");
const pip_services3_components_nodex_1 = require("pip-services3-components-nodex");
const CounterV1_1 = require("../data/version1/CounterV1");
class PerfMonMemoryPersistence {
    constructor() {
        this._maxPageSize = 100;
        this._counters = {};
    }
    configure(config) {
        this._maxPageSize = config.getAsIntegerWithDefault('options.max_page_size', this._maxPageSize);
    }
    matchString(value, search) {
        if (value == null && search == null)
            return true;
        if (value == null || search == null)
            return false;
        return value.toLowerCase().indexOf(search) >= 0;
    }
    counterContains(counter, search) {
        search = search.toLowerCase();
        if (this.matchString(counter.name, search))
            return true;
        if (this.matchString(counter.source, search))
            return true;
        return false;
    }
    getPageByFilter(correlationId, filter, paging) {
        return __awaiter(this, void 0, void 0, function* () {
            filter = filter || new pip_services3_commons_nodex_1.FilterParams();
            let search = filter.getAsNullableString("search");
            let type = filter.getAsNullableInteger("type");
            let name = filter.getAsNullableString("name");
            let nameStarts = filter.getAsNullableString("name_starts");
            let nameEnds = filter.getAsNullableString("name_ends");
            let groupName = filter.getAsNullableString("group");
            if (groupName != null && !groupName.endsWith("."))
                groupName = groupName + ".";
            let counterName = filter.getAsNullableString("counter");
            if (counterName != null && !counterName.startsWith("."))
                counterName = "." + counterName;
            paging = paging || new pip_services3_commons_nodex_2.PagingParams();
            let skip = paging.getSkip(0);
            let take = paging.getTake(this._maxPageSize);
            let data = [];
            let counters = this._counters;
            for (let prop in this._counters) {
                let counter = counters[prop];
                if (search != null && !this.counterContains(counter, search))
                    continue;
                if (type != null && type != counter.type)
                    continue;
                if (name != null && name != counter.name)
                    continue;
                if (nameStarts != null && !counter.name.startsWith(nameStarts))
                    continue;
                if (nameEnds != null && !counter.name.endsWith(nameEnds))
                    continue;
                if (groupName != null && !counter.name.startsWith(groupName))
                    continue;
                if (counterName != null && !counter.name.endsWith(counterName))
                    continue;
                skip--;
                if (skip >= 0)
                    continue;
                data.push(counter);
                take--;
                if (take <= 0)
                    break;
            }
            let total = data.length;
            let page = new pip_services3_commons_nodex_3.DataPage(data, total);
            return page;
        });
    }
    mergePerfMon(oldCounter, counter) {
        // If types are different then override old value
        if (oldCounter.type != counter.type)
            return counter;
        if (counter.type == pip_services3_components_nodex_1.CounterType.Increment) {
            let newCounter = new CounterV1_1.CounterV1(counter.name, counter.type);
            newCounter.count = oldCounter.count + counter.count;
            return newCounter;
        }
        else if (counter.type == pip_services3_components_nodex_1.CounterType.Interval
            || counter.type == pip_services3_components_nodex_1.CounterType.Statistics) {
            let newCounter = new CounterV1_1.CounterV1(counter.name, counter.type);
            newCounter.last = counter.last;
            newCounter.count = counter.count + oldCounter.count;
            newCounter.max = Math.max(counter.max, oldCounter.max);
            newCounter.min = Math.min(counter.min, oldCounter.max);
            newCounter.average = ((counter.average * counter.count)
                + (oldCounter.average * oldCounter.count))
                / (counter.count + oldCounter.count);
            return newCounter;
        }
        else {
            return counter;
        }
    }
    addOne(correlationId, counter) {
        return __awaiter(this, void 0, void 0, function* () {
            if (counter == null) {
                return;
            }
            let oldCounter = this._counters[counter.name];
            if (oldCounter)
                counter = this.mergePerfMon(oldCounter, counter);
            this._counters[counter.name] = counter;
            return counter;
        });
    }
    addBatch(correlationId, counters) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let counter of counters)
                yield this.addOne(correlationId, counter);
        });
    }
    clear(correlationId) {
        return __awaiter(this, void 0, void 0, function* () {
            this._counters = {};
        });
    }
    deleteExpired(correlationId, expireTime) {
        return __awaiter(this, void 0, void 0, function* () {
            let filtered = {};
            for (let key of Object.keys(this._counters)) {
                if (d => d.time ? d.time.getTime() > expireTime.getTime() : false)
                    filtered[key] = this._counters[key];
            }
            this._counters = filtered;
        });
    }
}
exports.PerfMonMemoryPersistence = PerfMonMemoryPersistence;
//# sourceMappingURL=PerfMonMemoryPersistence.js.map