const assert = require('chai').assert;

import { ConfigParams } from 'pip-services3-commons-nodex';
import { CounterType } from 'pip-services3-components-nodex';
import { FilterParams } from 'pip-services3-commons-nodex';

import { CounterV1 } from '../../src/data/version1/CounterV1';
import { PerfMonLambdaFunction } from '../../src/container/PerfMonLambdaFunction';


suite('PerfMonLambdaFunction', ()=> {
    let lambda: PerfMonLambdaFunction;

    suiteSetup(async () => {
        let config = ConfigParams.fromTuples(
            'logger.descriptor', 'pip-services:logger:console:default:1.0',
            'persistence.descriptor', 'service-perfmon:persistence:memory:default:1.0',
            'controller.descriptor', 'service-perfmon:controller:default:default:1.0'
        );

        lambda = new PerfMonLambdaFunction();
        lambda.configure(config);
        await lambda.open(null);
    });
    
    suiteTeardown(async () => {
        await lambda.close(null);
    });
    
    test('CRUD Operations', async () => {
        let counter = new CounterV1("counter1", CounterType.Statistics);
        counter.count = 1;
        counter.max = 10;
        counter.min = 1;
        counter.average = 5;

        counter = await lambda.act(
            {
                role: 'perfmon',
                cmd: 'write_counter',
                counter: counter
            }
        );

        assert.isObject(counter);

        let counter1 = new CounterV1("counter1", CounterType.Statistics);
        counter1.count = 2;
        counter1.max = 7;
        counter1.min = 0;
        counter1.average = 5;

        let counter2 = new CounterV1("counter2", CounterType.Statistics);
        counter2.count = 1;

        await lambda.act(
            {
                role: 'perfmon',
                cmd: 'write_counters',
                counters: [counter1, counter2]
            }
        );
        
        let page = await lambda.act(
            {
                role: 'perfmon',
                cmd: 'read_counters',
                filter: FilterParams.fromTuples("name", "counter1")
            }
        );

        assert.lengthOf(page.data, 1);

        counter = page.data[0];
        assert.equal(3, counter.count);
        assert.equal(0, counter.min);
        assert.equal(10, counter.max);
        assert.equal(5, counter.average);
    });
});