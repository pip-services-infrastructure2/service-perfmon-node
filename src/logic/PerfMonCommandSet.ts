import { CommandSet } from 'pip-services3-commons-nodex';
import { ICommand } from 'pip-services3-commons-nodex';
import { Command } from 'pip-services3-commons-nodex';
import { Parameters } from 'pip-services3-commons-nodex';
import { FilterParams } from 'pip-services3-commons-nodex';
import { PagingParams } from 'pip-services3-commons-nodex';
import { ObjectSchema } from 'pip-services3-commons-nodex';
import { ArraySchema } from 'pip-services3-commons-nodex';
import { FilterParamsSchema } from 'pip-services3-commons-nodex';
import { PagingParamsSchema } from 'pip-services3-commons-nodex';
import { DateTimeConverter } from 'pip-services3-commons-nodex';

import { CounterV1Schema } from '../data/version1/CounterV1Schema';
import { IPerfMonController } from './IPerfMonController';

export class PerfMonCommandSet extends CommandSet {
	private _logic: IPerfMonController;

	constructor(logic: IPerfMonController) {
		super();

		this._logic = logic;

		this.addCommand(this.makeReadCountersCommand());
		this.addCommand(this.makeWriteCounterCommand());
		this.addCommand(this.makeWriteCountersCommand());
		this.addCommand(this.makeClearCommand());
	}

	private makeReadCountersCommand(): ICommand {
		return new Command(
			"read_counters",
			new ObjectSchema(true)
				.withOptionalProperty('fitler', new FilterParamsSchema())
				.withOptionalProperty('paging', new PagingParamsSchema()),
			async (correlationId: string, args: Parameters) => {
				let filter = FilterParams.fromValue(args.get("filter"));
				let paging = PagingParams.fromValue(args.get("paging"));
				return await this._logic.readCounters(correlationId, filter, paging);
			}
		);
	}

	private makeWriteCounterCommand(): ICommand {
		return new Command(
			"write_counter",
			new ObjectSchema(true)
				.withRequiredProperty('counter', new CounterV1Schema()),
			async (correlationId: string, args: Parameters) => {
				let counter = args.get("counter");
				counter.time = DateTimeConverter.toNullableDateTime(counter.time);
				return await this._logic.writeCounter(correlationId, counter);
			}
		);
	}

	private makeWriteCountersCommand(): ICommand {
		return new Command(
			"write_counters",
			new ObjectSchema(true)
				.withRequiredProperty('counters', new ArraySchema(new CounterV1Schema())),
			async (correlationId: string, args: Parameters) => {
				let counters = args.get("counters");
				for (let counter of counters)
					counter.time = DateTimeConverter.toNullableDateTime(counter.time);
					
				return await this._logic.writeCounters(correlationId, counters);
			}
		);
	}

	private makeClearCommand(): ICommand {
		return new Command(
			"clear",
			null,
			async (correlationId: string, args: Parameters) => {
				return await this._logic.clear(correlationId);
			}
		);
	}

}