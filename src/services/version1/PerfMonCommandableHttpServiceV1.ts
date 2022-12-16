import { Descriptor } from 'pip-services3-commons-nodex';
import { CommandableHttpService } from 'pip-services3-rpc-nodex';

export class PerfMonCommandableHttpServiceV1 extends CommandableHttpService {
    public constructor() {
        super('v1/perfmon');
        this._dependencyResolver.put('controller', new Descriptor('service-perfmon', 'controller', 'default', '*', '1.0'));
    }
}