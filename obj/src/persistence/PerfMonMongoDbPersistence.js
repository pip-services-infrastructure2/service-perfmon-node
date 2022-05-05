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
exports.PerfMonMongoDbPersistence = void 0;
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const pip_services3_mongodb_nodex_1 = require("pip-services3-mongodb-nodex");
class PerfMonMongoDbPersistence extends pip_services3_mongodb_nodex_1.IdentifiableMongoDbPersistence {
    constructor() {
        super('counters');
        this._maxPageSize = 1000;
    }
    composeFilter(filter) {
        filter = filter || new pip_services3_commons_nodex_1.FilterParams();
        let criteria = [];
        let search = filter.getAsNullableString("search");
        if (search != null) {
            let searchRegex = new RegExp(search, "i");
            let searchCriteria = [];
            searchCriteria.push({ name: { $regex: searchRegex } });
            searchCriteria.push({ source: { $regex: searchRegex } });
            searchCriteria.push({ id: { $regex: searchRegex } });
            criteria.push({ $or: searchCriteria });
        }
        let id = filter.getAsNullableString("id");
        if (id != null)
            criteria.push({ _id: id });
        let type = filter.getAsNullableInteger("type");
        if (type != null)
            criteria.push({ type: type });
        let name = filter.getAsNullableString("name");
        if (name != null)
            criteria.push({ name: name });
        let name_starts = filter.getAsNullableString("name_starts");
        if (name_starts != null) {
            name_starts = name_starts.replace(".", "\\.");
            let searchRegex = new RegExp("^" + name_starts, "i");
            criteria.push({ name: { $regex: searchRegex } });
        }
        let name_ends = filter.getAsNullableString("name_ends");
        if (name_ends != null) {
            name_ends = name_ends.replace(".", "\\.");
            let searchRegex = new RegExp(name_ends + "&", "i");
            criteria.push({ name: { $regex: searchRegex } });
        }
        let group = filter.getAsNullableString("group");
        if (group != null) {
            let groupWithDot = group + group[group.length - 1] == "." ? "" : ".";
            groupWithDot = groupWithDot.replace(".", "\\.");
            let searchRegex = new RegExp(groupWithDot + "&", "i");
            criteria.push({ name: { $regex: searchRegex } });
        }
        let counter = filter.getAsNullableString("counter");
        if (counter != null) {
            let counterWithDot = counter + counter[0] == "." ? "" : ".";
            counterWithDot = counterWithDot.replace(".", "\\.");
            let searchRegex = new RegExp("^" + counterWithDot, "i");
            criteria.push({ name: { $regex: searchRegex } });
        }
        let fromTime = filter.getAsNullableDateTime("from_time");
        if (fromTime != null)
            criteria.push({ time: { $gte: fromTime } });
        let toTime = filter.getAsNullableDateTime("to_time");
        if (toTime != null)
            criteria.push({ time: { $lt: toTime } });
        return criteria.length > 0 ? { $and: criteria } : null;
    }
    getPageByFilter(correlationId, filter, paging) {
        const _super = Object.create(null, {
            getPageByFilter: { get: () => super.getPageByFilter }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return yield _super.getPageByFilter.call(this, correlationId, this.composeFilter(filter), paging, null, null);
        });
    }
    deleteByFilter(correlationId, filter) {
        const _super = Object.create(null, {
            deleteByFilter: { get: () => super.deleteByFilter }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return yield _super.deleteByFilter.call(this, correlationId, this.composeFilter(filter));
        });
    }
    addOne(correlationId, counter) {
        const _super = Object.create(null, {
            set: { get: () => super.set }
        });
        return __awaiter(this, void 0, void 0, function* () {
            if (counter == null) {
                return;
            }
            return yield _super.set.call(this, correlationId, counter);
        });
    }
    addBatch(correlationId, counters) {
        return __awaiter(this, void 0, void 0, function* () {
            if (counters == null || counters.length == 0) {
                return;
            }
            let batch = this._collection.collection.initializeUnorderedBulkOp();
            for (let counter of counters) {
                if (batch) {
                    batch.find({ _id: counter.id }).upsert().updateOne({
                        $setOnInsert: { name: counter.name, source: counter.source, type: counter.type },
                        $set: { last: counter.last, count: counter.count, min: counter.min, max: counter.max, average: counter.average, time: counter.time }
                    });
                }
            }
            if (batch) {
                batch.execute((err) => {
                    if (!err)
                        this._logger.trace(correlationId, "Created %d data in %s", counters.length, this._collection);
                });
            }
        });
    }
    deleteExpired(correlationId, expireTime) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.deleteByFilter(correlationId, pip_services3_commons_nodex_1.FilterParams.fromTuples("to_time", expireTime));
        });
    }
}
exports.PerfMonMongoDbPersistence = PerfMonMongoDbPersistence;
//# sourceMappingURL=PerfMonMongoDbPersistence.js.map