import { CommandSet } from 'pip-services3-commons-nodex';
import { IPerfMonController } from './IPerfMonController';
export declare class PerfMonCommandSet extends CommandSet {
    private _logic;
    constructor(logic: IPerfMonController);
    private makeReadCountersCommand;
    private makeWriteCounterCommand;
    private makeWriteCountersCommand;
    private makeClearCommand;
}
