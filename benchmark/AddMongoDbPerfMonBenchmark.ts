let async = require('async');

import { Benchmark } from 'pip-benchmark-node';
import { DateTimeConverter } from 'pip-services3-commons-nodex';

import { ConfigParams } from 'pip-services3-commons-nodex';
import { Descriptor } from 'pip-services3-commons-nodex';
import { References } from 'pip-services3-commons-nodex';

import { CounterV1 } from '../src/data/version1/CounterV1';
import { PerfMonMongoDbPersistence } from '../src/persistence/PerfMonMongoDbPersistence';
import { PerfMonController } from '../src/logic/PerfMonController';

export class AddMongoDbPerfMonBenchmark extends Benchmark {
    private _initialRecordNumber: number;
    private _sourceQuantity: number;
    private _startTime: Date;
    private _interval: number;

    private _source: string;
    private _time: Date;

    private _persistence: PerfMonMongoDbPersistence;
    private _controller: PerfMonController;

    public constructor() {
        super("AddMongoDbPerfMon", "Measures performance of adding PerfMon into MongoDB database");
    }

    public async setUp(): Promise<void> {
        this._initialRecordNumber = this.context.parameters.InitialRecordNumber.getAsInteger();
        this._sourceQuantity = this.context.parameters.SourceQuantity.getAsInteger();
        this._startTime = DateTimeConverter.toDateTime(this.context.parameters.StartTime.getAsString());
        this._interval = this.context.parameters.Interval.getAsInteger();

        this._time = this._startTime;
        this._source = this.getRandomString(10);

        let mongoUri = this.context.parameters.MongoUri.getAsString();
        let mongoHost = this.context.parameters.MongoHost.getAsString();
        let mongoPort = this.context.parameters.MongoPort.getAsInteger();
        let mongoDb = this.context.parameters.MongoDb.getAsString();

        this._persistence = new PerfMonMongoDbPersistence();
        this._persistence.configure(ConfigParams.fromTuples(
            'connection.uri', mongoUri,
            'connection.host', mongoHost,
            'connection.port', mongoPort,
            'connection.database', mongoDb
        ));

        this._controller = new PerfMonController();

        let references: References = References.fromTuples(
            new Descriptor('service-perfmon', 'persistence', 'mongodb', 'default', '1.0'), this._persistence,
            new Descriptor('service-perfmon', 'controller', 'default', 'default', '1.0'), this._controller
        );
        this._controller.setReferences(references);

        await this._persistence.open(null);
        this.context.sendMessage('Connected to mongodb database');

    }

    public async tearDown(): Promise<void> {
        await this._persistence.close(null);
        if (this.context)
            this.context.sendMessage('Disconnected from mongodb database');

        this._persistence = null;
        this._controller = null;
    }

    private getRandomString(length: number): string {
        return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
    }

    private getRandomInteger(min: number, max: number): number {
        return Math.floor(Math.floor(Math.random() * (max - min)) + min);
    }

    public async execute(): Promise<void> {
        let counters: CounterV1[] = [];

        for (let sourceNumber = 1; sourceNumber <= this._sourceQuantity; sourceNumber++) {
            counters.push({
                id: this.getRandomString(10),
                name: this.getRandomString(10),
                time: this._time,
                source: this.getRandomString(10),
                type: this.getRandomInteger(0, 4),
                last: this.getRandomInteger(0, 10),
                count: this.getRandomInteger(0, 10),
                min: this.getRandomInteger(0, 10),
                max: this.getRandomInteger(0, 10),
                average: this.getRandomInteger(0, 10),
            });
        }

        this._time = new Date(this._time.getTime() + this._interval);

        await this._controller.writeCounters(null, counters);
    }

}