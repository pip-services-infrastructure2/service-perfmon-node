import { ConfigParams } from 'pip-services3-commons-nodex';
import { IConfigurable } from 'pip-services3-commons-nodex';
import { FilterParams } from 'pip-services3-commons-nodex';
import { PagingParams } from 'pip-services3-commons-nodex';
import { DataPage } from 'pip-services3-commons-nodex';
import { CounterType } from 'pip-services3-components-nodex';

import { CounterV1 } from '../data/version1/CounterV1';
import { IPerfMonPersistence } from './IPerfMonPersistence';

export class PerfMonMemoryPersistence implements IPerfMonPersistence, IConfigurable {
    private _maxPageSize: number = 100;

    private _counters: { [index: string]: CounterV1 } = {};

    public constructor() { }

    public configure(config: ConfigParams): void {
        this._maxPageSize = config.getAsIntegerWithDefault('options.max_page_size', this._maxPageSize);
    }

    private matchString(value: string, search: string): boolean {
        if (value == null && search == null)
            return true;
        if (value == null || search == null)
            return false;
        return value.toLowerCase().indexOf(search) >= 0;
    }

    private counterContains(counter: CounterV1, search: string): boolean {
        search = search.toLowerCase();

        if (this.matchString(counter.name, search))
            return true;

        if (this.matchString(counter.source, search))
            return true;

        return false;
    }

    public async getPageByFilter(correlationId: string, filter: FilterParams, paging: PagingParams): Promise<DataPage<CounterV1>> {

        filter = filter || new FilterParams();
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

        paging = paging || new PagingParams();
        let skip = paging.getSkip(0);
        let take = paging.getTake(this._maxPageSize);
        let data: CounterV1[] = [];

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
            if (skip >= 0) continue;

            data.push(counter);

            take--;
            if (take <= 0) break;
        }

        let total = data.length;
        let page = new DataPage<CounterV1>(data, total);

        return page;
    }

    private mergePerfMon(oldCounter: CounterV1, counter: CounterV1): CounterV1 {
        // If types are different then override old value
        if (oldCounter.type != counter.type)
            return counter;

        if (counter.type == CounterType.Increment) {
            let newCounter = new CounterV1(counter.name, counter.type);
            newCounter.count = oldCounter.count + counter.count;
            return newCounter;
        } else if (counter.type == CounterType.Interval
            || counter.type == CounterType.Statistics) {

            let newCounter = new CounterV1(counter.name, counter.type);

            newCounter.last = counter.last;
            newCounter.count = counter.count + oldCounter.count;
            newCounter.max = Math.max(counter.max, oldCounter.max);
            newCounter.min = Math.min(counter.min, oldCounter.max);
            newCounter.average = ((counter.average * counter.count)
                + (oldCounter.average * oldCounter.count))
                / (counter.count + oldCounter.count);

            return newCounter;
        } else {
            return counter;
        }
    }

    public async addOne(correlationId: string, counter: CounterV1): Promise<CounterV1> {

        if (counter == null) {
            return;
        }

        let oldCounter = this._counters[counter.name];
        if (oldCounter)
            counter = this.mergePerfMon(oldCounter, counter);

        this._counters[counter.name] = counter;

        return counter;
    }

    public async addBatch(correlationId: string, counters: CounterV1[]): Promise<void> {

        for (let counter of counters)
            await this.addOne(correlationId, counter);
    }

    public async clear(correlationId: string): Promise<void> {
        this._counters = {};
    }

    public async deleteExpired(correlationId: string, expireTime: Date): Promise<void> {
        let filtered: { [index: string]: CounterV1 } = {};

        for (let key of Object.keys(this._counters)) {
            if (d => d.time ? d.time.getTime() > expireTime.getTime() : false)
                filtered[key] = this._counters[key];
        }
        
        this._counters = filtered;
    }

}