import { ConfigParams, IOpenable } from 'pip-services3-commons-nodex';
import { IConfigurable } from 'pip-services3-commons-nodex';
import { IReferences } from 'pip-services3-commons-nodex';
import { Descriptor } from 'pip-services3-commons-nodex';
import { IReferenceable } from 'pip-services3-commons-nodex';
import { DependencyResolver } from 'pip-services3-commons-nodex';
import { FilterParams } from 'pip-services3-commons-nodex';
import { PagingParams } from 'pip-services3-commons-nodex';
import { DataPage } from 'pip-services3-commons-nodex';
import { CommandSet } from 'pip-services3-commons-nodex';
import { ICommandable } from 'pip-services3-commons-nodex';

import { CounterV1 } from '../data/version1/CounterV1';
import { IPerfMonPersistence } from '../persistence/IPerfMonPersistence';
import { IPerfMonController } from './IPerfMonController';
import { PerfMonCommandSet } from './PerfMonCommandSet';

export class PerfMonController
    implements IPerfMonController, ICommandable, IConfigurable, IReferenceable, IOpenable {

    private _dependencyResolver: DependencyResolver;
    private _persistence: IPerfMonPersistence;
    private _commandSet: PerfMonCommandSet;
    private _expireCleanupTimeout: number = 60; // 60 min
    private _expireTimeout: number = 3; // 3 days
    private _interval: any = null;

    constructor() {
        this._dependencyResolver = new DependencyResolver();
        this._dependencyResolver.put('persistence', new Descriptor('service-perfmon', 'persistence', '*', '*', '*'));
    }

    private asyncInterval(callback, ms, triesLeft = 5) {
        return new Promise((resolve, reject) => {
            const interval = setInterval(async () => {
                if (await callback()) {
                    resolve(null);
                    clearInterval(interval);
                } else if (triesLeft <= 1) {
                    reject();
                    clearInterval(interval);
                }
                triesLeft--;
            }, ms);
        });
    }

    public getCommandSet(): CommandSet {
        if (this._commandSet == null)
            this._commandSet = new PerfMonCommandSet(this);
        return this._commandSet;
    }

    public configure(config: ConfigParams): void {
        this._dependencyResolver.configure(config);
        this._expireCleanupTimeout = config.getAsIntegerWithDefault('options.expire_cleanup_timeout', this._expireCleanupTimeout)
        this._expireTimeout = config.getAsIntegerWithDefault('options._expire_counter_timeout', this._expireTimeout)
    }

    public setReferences(references: IReferences): void {
        this._dependencyResolver.setReferences(references);
        this._persistence = this._dependencyResolver.getOneRequired<IPerfMonPersistence>('persistence');
    }

    public isOpen(): boolean {
        return this._interval != null;
    }

    public async open(correlationId: string): Promise<void> {
        if (this._interval != null) {
            clearInterval(this._interval);
        }
        
        this._interval = setInterval(async () => {
            await this.deleteExpired(correlationId);
        }, 1000 * 60 * this._expireCleanupTimeout);
    }

    public async close(correlationId: string): Promise<void> {
        if (this._interval != null) {
            clearTimeout(this._interval);
            this._interval = null;
        }
    }

    public async writeCounter(correlationId: string, counter: CounterV1): Promise<CounterV1> {
        counter.id = counter.name + "_" + counter.source;
        counter.time = counter.time || new Date();

        return await this._persistence.addOne(correlationId, counter);
    }

    public async writeCounters(correlationId: string, counters: CounterV1[]): Promise<void> {
        if (counters == null || counters.length == 0) {
            return;
        }

        for (let counter of counters) {
            counter.id = counter.name + "_" + counter.source;
            counter.time = counter.time || new Date();
        }

        return await this._persistence.addBatch(correlationId, counters);
    }

    public async readCounters(correlationId: string, filter: FilterParams, paging: PagingParams): Promise<DataPage<CounterV1>> {
        return await this._persistence.getPageByFilter(correlationId, filter, paging);
    }

    public async clear(correlationId: string): Promise<void> {
        return await this._persistence.clear(correlationId);
    }

    public async deleteExpired(correlationId: string): Promise<void> {
        let now = new Date().getTime();
        let expireTime = new Date(now - this._expireTimeout * 24 * 3600000);

        return await this._persistence.deleteExpired(correlationId, expireTime);
    }
}
