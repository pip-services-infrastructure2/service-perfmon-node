import { FilterParams } from 'pip-services3-commons-nodex';
import { PagingParams } from 'pip-services3-commons-nodex';
import { DataPage } from 'pip-services3-commons-nodex';
import { IdentifiableMongoDbPersistence } from 'pip-services3-mongodb-nodex';


import { CounterV1 } from '../data/version1/CounterV1';
import { IPerfMonPersistence } from './IPerfMonPersistence';

export class PerfMonMongoDbPersistence extends IdentifiableMongoDbPersistence<CounterV1, string> implements IPerfMonPersistence {

    constructor() {
        super('counters');
        this._maxPageSize = 1000;
    }

    private composeFilter(filter: any) {
        filter = filter || new FilterParams();

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
            let groupWithDot = group + group[group.length - 1] == "." ? "" : "."
            groupWithDot = groupWithDot.replace(".", "\\.");
            let searchRegex = new RegExp(groupWithDot + "&", "i");
            criteria.push({ name: { $regex: searchRegex } });
        }

        let counter = filter.getAsNullableString("counter");
        if (counter != null) {
            let counterWithDot = counter + counter[0] == "." ? "" : "."
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

    public async getPageByFilter(correlationId: string, filter: FilterParams, paging: PagingParams): Promise<DataPage<CounterV1>> {
        return await super.getPageByFilter(correlationId, this.composeFilter(filter), paging, null, null);
    }

    public async deleteByFilter(correlationId: string, filter: FilterParams): Promise<void> {
        return await super.deleteByFilter(correlationId, this.composeFilter(filter));
    }

    public async addOne(correlationId: string, counter: CounterV1): Promise<CounterV1> {

        if (counter == null) {
            return;
        }

        return await super.set(correlationId, counter);

    }

    public async addBatch(correlationId: string, counters: CounterV1[]): Promise<void> {
        if (counters == null || counters.length == 0) {
            return;
        }

        let batch = this._collection.collection.initializeUnorderedBulkOp();

        for (let counter of counters) {
            if (batch) {
                batch.find({ _id: counter.id }).upsert().updateOne(
                    {
                        $setOnInsert: { name: counter.name, source: counter.source, type: counter.type },
                        $set: { last: counter.last, count: counter.count,  min: counter.min, max: counter.max, average: counter.average, time: counter.time}
                    }
                );
            }
        }

        if (batch) {
            batch.execute((err) => {
                if (!err)
                    this._logger.trace(correlationId, "Created %d data in %s", counters.length, this._collection)
            });
        }
    }

    public async deleteExpired(correlationId: string, expireTime: Date): Promise<void> {
        return await this.deleteByFilter(correlationId, FilterParams.fromTuples("to_time", expireTime));
    }
}