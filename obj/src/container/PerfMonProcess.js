"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerfMonProcess = void 0;
const pip_services3_container_nodex_1 = require("pip-services3-container-nodex");
const pip_services3_rpc_nodex_1 = require("pip-services3-rpc-nodex");
const pip_services3_swagger_nodex_1 = require("pip-services3-swagger-nodex");
const PerfMonServiceFactory_1 = require("../build/PerfMonServiceFactory");
class PerfMonProcess extends pip_services3_container_nodex_1.ProcessContainer {
    constructor() {
        super("perfmon", "Performance counters microservice");
        this._factories.add(new PerfMonServiceFactory_1.PerfMonServiceFactory);
        this._factories.add(new pip_services3_rpc_nodex_1.DefaultRpcFactory);
        this._factories.add(new pip_services3_swagger_nodex_1.DefaultSwaggerFactory);
    }
}
exports.PerfMonProcess = PerfMonProcess;
//# sourceMappingURL=PerfMonProcess.js.map