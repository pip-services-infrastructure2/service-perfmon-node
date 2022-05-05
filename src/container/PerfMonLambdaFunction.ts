import { Descriptor } from 'pip-services3-commons-nodex';
import { CommandableLambdaFunction } from 'pip-services3-aws-nodex';
import { PerfMonServiceFactory } from '../build/PerfMonServiceFactory';

export class PerfMonLambdaFunction extends CommandableLambdaFunction {
    public constructor() {
        super("perfmon", "Performance counters function");
        this._dependencyResolver.put('controller', new Descriptor('service-perfmon', 'controller', 'default', '*', '*'));
        this._factories.add(new PerfMonServiceFactory());
    }
}

export const handler = new PerfMonLambdaFunction().getHandler();