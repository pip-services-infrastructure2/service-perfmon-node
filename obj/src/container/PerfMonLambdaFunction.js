"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.PerfMonLambdaFunction = void 0;
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const pip_services3_aws_nodex_1 = require("pip-services3-aws-nodex");
const PerfMonServiceFactory_1 = require("../build/PerfMonServiceFactory");
class PerfMonLambdaFunction extends pip_services3_aws_nodex_1.CommandableLambdaFunction {
    constructor() {
        super("perfmon", "Performance counters function");
        this._dependencyResolver.put('controller', new pip_services3_commons_nodex_1.Descriptor('service-perfmon', 'controller', 'default', '*', '*'));
        this._factories.add(new PerfMonServiceFactory_1.PerfMonServiceFactory());
    }
}
exports.PerfMonLambdaFunction = PerfMonLambdaFunction;
exports.handler = new PerfMonLambdaFunction().getHandler();
//# sourceMappingURL=PerfMonLambdaFunction.js.map