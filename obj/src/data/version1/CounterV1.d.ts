import { CounterType } from 'pip-services3-components-nodex';
export declare class CounterV1 {
    constructor(name?: string, type?: CounterType);
    id: string;
    name: string;
    source: string;
    type: CounterType;
    last: number;
    count: number;
    min: number;
    max: number;
    average: number;
    time: Date;
}
