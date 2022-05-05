import { DataPage } from 'pip-services3-commons-nodex';
import { FilterParams } from 'pip-services3-commons-nodex';
import { PagingParams } from 'pip-services3-commons-nodex';
import { ICleanable } from 'pip-services3-commons-nodex';

import { CounterV1 } from '../data/version1/CounterV1';

export interface IPerfMonPersistence extends ICleanable {
    getPageByFilter(correlationId: string, filter: FilterParams, paging: PagingParams): Promise<DataPage<CounterV1>>;

    addOne(correlationId: string, counter: CounterV1): Promise<CounterV1>;

    addBatch(correlationId: string, counters: CounterV1[]): Promise<void>;

    clear(correlationId: string): Promise<void>;

    deleteExpired(correlationId: string, expireTime: Date): Promise<void>;
}
