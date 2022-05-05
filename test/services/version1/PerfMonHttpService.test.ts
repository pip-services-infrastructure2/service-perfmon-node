const restify = require('restify');
const assert = require('chai').assert;

import { ConfigParams } from 'pip-services3-commons-nodex';
import { Descriptor } from 'pip-services3-commons-nodex';
import { References } from 'pip-services3-commons-nodex';
import { FilterParams } from 'pip-services3-commons-nodex';
import { CounterType } from 'pip-services3-components-nodex';

import { CounterV1 } from '../../../src/data/version1/CounterV1';
import { PerfMonMemoryPersistence } from '../../../src/persistence/PerfMonMemoryPersistence';
import { PerfMonController } from '../../../src/logic/PerfMonController';
import { PerfMonHttpServiceV1 } from '../../../src/services/version1/PerfMonHttpServiceV1';

let restConfig = ConfigParams.fromTuples(
    "connection.protocol", "http",
    "connection.host", "localhost",
    "connection.port", 3000
);

suite('PerfMonHttpServiceV1', ()=> {
    let service: PerfMonHttpServiceV1;

    let rest: any;

    suiteSetup(async () => {
        let persistence = new PerfMonMemoryPersistence();
        let controller = new PerfMonController();

        service = new PerfMonHttpServiceV1();
        service.configure(restConfig);

        let references: References = References.fromTuples(
            new Descriptor('service-perfmon', 'persistence', 'memory', 'default', '1.0'), persistence,
            new Descriptor('service-perfmon', 'controller', 'default', 'default', '1.0'), controller,
            new Descriptor('service-perfmon', 'service', 'http', 'default', '1.0'), service
        );
        controller.setReferences(references);
        service.setReferences(references);

        await service.open(null);
    });
    
    suiteTeardown(async () => {
        await service.close(null);
    });

    setup(() => {
        let url = 'http://localhost:3000';
        rest = restify.createJsonClient({ url: url, version: '*' });
    });

    test('CRUD Operations', async () => {
        let counter = new CounterV1("counter1", CounterType.Statistics);
        counter.count = 1;
        counter.max = 10;
        counter.min = 1;
        counter.average = 5;

        let counters = await new Promise<any>((resolve, reject) => {
            rest.post('/v1/perfmon/write_counter',
                {
                    counter: counter
                },
                (err, req, res, result) => {
                    if (err == null) resolve(result);
                    else reject(err);
                }
            );
        });

        assert.isObject(counter);

        let counter1 = new CounterV1("counter1", CounterType.Statistics);
        counter1.count = 2;
        counter1.max = 7;
        counter1.min = 0;
        counter1.average = 5;

        let counter2 = new CounterV1("counter2", CounterType.Statistics);
        counter2.count = 1;

        counters = await new Promise<any>((resolve, reject) => {
            rest.post('/v1/perfmon/write_counters',
                {
                    counters: [counter1, counter2]
                },
                (err, req, res, result) => {
                    if (err == null) resolve(result);
                    else reject(err);
                }
            );
        });

        let page = await new Promise<any>((resolve, reject) => {
            rest.post('/v1/perfmon/read_counters',
                {
                    filter: FilterParams.fromTuples("name", "counter1")
                }, 
                (err, req, res, result) => {
                    if (err == null) resolve(result);
                    else reject(err);
                }
            );
        });

        assert.lengthOf(page.data, 1);

        counter = page.data[0];
        assert.equal(3, counter.count);
        assert.equal(0, counter.min);
        assert.equal(10, counter.max);
        assert.equal(5, counter.average);

    });
});