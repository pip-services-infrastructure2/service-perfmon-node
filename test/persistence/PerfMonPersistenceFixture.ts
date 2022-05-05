const assert = require('chai').assert;

import { FilterParams } from 'pip-services3-commons-nodex';
import { CounterType } from 'pip-services3-components-nodex';

import { CounterV1 } from '../../src/data/version1/CounterV1';
import { IPerfMonPersistence } from '../../src/persistence/IPerfMonPersistence';

export class PerfMonPersistenceFixture {
    private _persistence: IPerfMonPersistence;
    
    constructor(persistence) {
        assert.isNotNull(persistence);
        this._persistence = persistence;
    }

    public async testCreateCounter() {
        let counter = new CounterV1("test.counter1", CounterType.Statistics);
        counter.count = 1;
        counter.max = 10;
        counter.min = 1;
        counter.average = 5;

        counter = await this._persistence.addOne(null, counter);

        assert.isObject(counter);

        counter = new CounterV1("test.counter2", CounterType.Increment);
        counter.count = 1;

        counter = await this._persistence.addOne(null, counter);

        assert.isObject(counter);

        counter = new CounterV1("test1.counter1", CounterType.LastValue);
        counter.last = 123;

        counter = await this._persistence.addOne(null, counter);

        assert.isObject(counter);
    }

    public async testReadWrite() {
        let fromTime = new Date();

        await this.testCreateCounter();

        let page = await this._persistence.getPageByFilter(null, FilterParams.fromTuples("name_starts", "test."), null);

        assert.lengthOf(page.data, 2);

        page = await this._persistence.getPageByFilter(null, FilterParams.fromTuples("type", CounterType.Increment), null);

        assert.lengthOf(page.data, 1);

        page = await this._persistence.getPageByFilter(null, FilterParams.fromTuples("search", "counter1"), null);
        
        assert.lengthOf(page.data, 2);
    }
}
