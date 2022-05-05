const assert = require('chai').assert;

import { Descriptor } from 'pip-services3-commons-nodex';
import { References } from 'pip-services3-commons-nodex';
import { CounterType } from 'pip-services3-components-nodex';
import { FilterParams } from 'pip-services3-commons-nodex';

import { CounterV1 } from '../../src/data/version1/CounterV1';
import { PerfMonMemoryPersistence } from '../../src/persistence/PerfMonMemoryPersistence';
import { PerfMonController } from '../../src/logic/PerfMonController';

suite('PerfMonController', ()=> {
    let controller: PerfMonController;

    suiteSetup(() => {
        let persistence = new PerfMonMemoryPersistence();
        controller = new PerfMonController();

        let references: References = References.fromTuples(
            new Descriptor('service-perfmon', 'persistence', 'memory', 'default', '1.0'), persistence,
            new Descriptor('service-perfmon', 'controller', 'default', 'default', '1.0'), controller
        );
        controller.setReferences(references);
    });
    
    setup(async () => {
        await controller.clear(null);
    });
    
    test('CRUD Operations', async () => {
        let counter = new CounterV1("counter1", CounterType.Statistics);
        counter.count = 1;
        counter.max = 10;
        counter.min = 1;
        counter.average = 5;

        counter = await controller.writeCounter(null, counter);

        assert.isObject(counter);

        let counter1 = new CounterV1("counter1", CounterType.Statistics);
        counter1.count = 2;
        counter1.max = 7;
        counter1.min = 0;
        counter1.average = 5;

        let counter2 = new CounterV1("counter2", CounterType.Statistics);
        counter2.count = 1;

        await controller.writeCounters(
            null,
            [counter1, counter2]
        );

        let page = await controller.readCounters(
            null,
            FilterParams.fromTuples("name", "counter1"),
            null
        );

        assert.lengthOf(page.data, 1);

        counter = page.data[0];
        assert.equal(3, counter.count);
        assert.equal(0, counter.min);
        assert.equal(10, counter.max);
        assert.equal(5, counter.average);
    });
});