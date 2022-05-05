import { ConfigParams } from 'pip-services3-commons-nodex';
import { IConfigurable } from 'pip-services3-commons-nodex';
import { FilterParams } from 'pip-services3-commons-nodex';
import { PagingParams } from 'pip-services3-commons-nodex';
import { DataPage } from 'pip-services3-commons-nodex';
import { CounterV1 } from '../data/version1/CounterV1';
import { IPerfMonPersistence } from './IPerfMonPersistence';
export declare class PerfMonMemoryPersistence implements IPerfMonPersistence, IConfigurable {
    private _maxPageSize;
    private _counters;
    constructor();
    configure(config: ConfigParams): void;
    private matchString;
    private counterContains;
    getPageByFilter(correlationId: string, filter: FilterParams, paging: PagingParams): Promise<DataPage<CounterV1>>;
    private mergePerfMon;
    addOne(correlationId: string, counter: CounterV1): Promise<CounterV1>;
    addBatch(correlationId: string, counters: CounterV1[]): Promise<void>;
    clear(correlationId: string): Promise<void>;
    deleteExpired(correlationId: string, expireTime: Date): Promise<void>;
}
