import { FilterParams } from 'pip-services3-commons-nodex';
import { PagingParams } from 'pip-services3-commons-nodex';
import { DataPage } from 'pip-services3-commons-nodex';
import { IdentifiableMongoDbPersistence } from 'pip-services3-mongodb-nodex';
import { CounterV1 } from '../data/version1/CounterV1';
import { IPerfMonPersistence } from './IPerfMonPersistence';
export declare class PerfMonMongoDbPersistence extends IdentifiableMongoDbPersistence<CounterV1, string> implements IPerfMonPersistence {
    constructor();
    private composeFilter;
    getPageByFilter(correlationId: string, filter: FilterParams, paging: PagingParams): Promise<DataPage<CounterV1>>;
    deleteByFilter(correlationId: string, filter: FilterParams): Promise<void>;
    addOne(correlationId: string, counter: CounterV1): Promise<CounterV1>;
    addBatch(correlationId: string, counters: CounterV1[]): Promise<void>;
    deleteExpired(correlationId: string, expireTime: Date): Promise<void>;
}
