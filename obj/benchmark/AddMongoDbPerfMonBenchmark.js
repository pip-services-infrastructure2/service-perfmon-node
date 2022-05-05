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
exports.AddMongoDbPerfMonBenchmark = void 0;
let async = require('async');
const pip_benchmark_node_1 = require("pip-benchmark-node");
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_2 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_3 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_4 = require("pip-services3-commons-nodex");
const PerfMonMongoDbPersistence_1 = require("../src/persistence/PerfMonMongoDbPersistence");
const PerfMonController_1 = require("../src/logic/PerfMonController");
class AddMongoDbPerfMonBenchmark extends pip_benchmark_node_1.Benchmark {
    constructor() {
        super("AddMongoDbPerfMon", "Measures performance of adding PerfMon into MongoDB database");
    }
    setUp() {
        return __awaiter(this, void 0, void 0, function* () {
            this._initialRecordNumber = this.context.parameters.InitialRecordNumber.getAsInteger();
            this._sourceQuantity = this.context.parameters.SourceQuantity.getAsInteger();
            this._startTime = pip_services3_commons_nodex_1.DateTimeConverter.toDateTime(this.context.parameters.StartTime.getAsString());
            this._interval = this.context.parameters.Interval.getAsInteger();
            this._time = this._startTime;
            this._source = this.getRandomString(10);
            let mongoUri = this.context.parameters.MongoUri.getAsString();
            let mongoHost = this.context.parameters.MongoHost.getAsString();
            let mongoPort = this.context.parameters.MongoPort.getAsInteger();
            let mongoDb = this.context.parameters.MongoDb.getAsString();
            this._persistence = new PerfMonMongoDbPersistence_1.PerfMonMongoDbPersistence();
            this._persistence.configure(pip_services3_commons_nodex_2.ConfigParams.fromTuples('connection.uri', mongoUri, 'connection.host', mongoHost, 'connection.port', mongoPort, 'connection.database', mongoDb));
            this._controller = new PerfMonController_1.PerfMonController();
            let references = pip_services3_commons_nodex_4.References.fromTuples(new pip_services3_commons_nodex_3.Descriptor('service-perfmon', 'persistence', 'mongodb', 'default', '1.0'), this._persistence, new pip_services3_commons_nodex_3.Descriptor('service-perfmon', 'controller', 'default', 'default', '1.0'), this._controller);
            this._controller.setReferences(references);
            yield this._persistence.open(null);
            this.context.sendMessage('Connected to mongodb database');
        });
    }
    tearDown() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._persistence.close(null);
            if (this.context)
                this.context.sendMessage('Disconnected from mongodb database');
            this._persistence = null;
            this._controller = null;
        });
    }
    getRandomString(length) {
        return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
    }
    getRandomInteger(min, max) {
        return Math.floor(Math.floor(Math.random() * (max - min)) + min);
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            let counters = [];
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
            yield this._controller.writeCounters(null, counters);
        });
    }
}
exports.AddMongoDbPerfMonBenchmark = AddMongoDbPerfMonBenchmark;
//# sourceMappingURL=AddMongoDbPerfMonBenchmark.js.map