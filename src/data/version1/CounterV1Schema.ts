import { ObjectSchema } from 'pip-services3-commons-nodex';
import { TypeCode } from 'pip-services3-commons-nodex';

export class CounterV1Schema extends ObjectSchema {
    public constructor() {
        super();
        this.withOptionalProperty('id', TypeCode.String);
        this.withRequiredProperty('name', TypeCode.String);
        this.withOptionalProperty('source', TypeCode.String);
        this.withRequiredProperty('type', TypeCode.Long);
        this.withOptionalProperty('time', null); //TypeCode.DateTime);
        this.withOptionalProperty('last', null);
        this.withOptionalProperty('count', TypeCode.Long);
        this.withOptionalProperty('min', null); //TypeCode.Double);
        this.withOptionalProperty('max', null); //TypeCode.Double);
        this.withOptionalProperty('average', null); //TypeCode.Double);
    }
}
