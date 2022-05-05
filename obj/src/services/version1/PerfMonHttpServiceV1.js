"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerfMonHttpServiceV1 = void 0;
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const pip_services3_rpc_nodex_1 = require("pip-services3-rpc-nodex");
class PerfMonHttpServiceV1 extends pip_services3_rpc_nodex_1.CommandableHttpService {
    constructor() {
        super('v1/perfmon');
        this._dependencyResolver.put('controller', new pip_services3_commons_nodex_1.Descriptor('service-perfmon', 'controller', 'default', '*', '1.0'));
    }
}
exports.PerfMonHttpServiceV1 = PerfMonHttpServiceV1;
//# sourceMappingURL=PerfMonHttpServiceV1.js.map