# Perfmon Microservice

This is a perforamce monitor microservice from Pip.Services library. 
It collects performance metrics from distributed microservices, stores 
and provides a single entry point to read all of them.

The microservice currently supports the following deployment options:
* Deployment platforms: Standalone Process, Seneca Plugin
* External APIs: HTTP/REST, Seneca
* Persistence: Memory

This microservice has no dependencies on other microservices.

<a name="links"></a> Quick Links:

* [Download Links](doc/Downloads.md)
* [Development Guide](doc/Development.md)
* [Configuration Guide](doc/Configuration.md)
* [Deployment Guide](doc/Deployment.md)
* Client SDKs
  - [Node.js SDK](https://github.com/pip-services-infrastructure2/client-perfmon-node)
* Communication Protocols
  - [HTTP Version 1](doc/HttpProtocolV1.md)
  - [Seneca Version 1](doc/SenecaProtocolV1.md)

## Contract

Logical contract of the microservice is presented below. For physical implementation (HTTP/REST, Thrift, Seneca, Lambda, etc.),
please, refer to documentation of the specific protocol.

```typescript
enum CounterType {
    Interval = 0,
    LastValue = 1,
    Statistics = 2,
    Timestamp = 3,
    Increment = 4
}

class CounterV1 {
    public constructor(name: string, type: CounterType) {
        this.name = name;
        this.type = type;
    }

    public name: string;
    public type: CounterType;
    public last: number;
    public count: number;
    public min: number;
    public max: number;
    public average: number;
    public time: Date;
}

interface IPerfMonV1 {
    readPerfMon(correlationId: string, filter: FilterParams, paging: PagingParams): Promise<DataPage<CounterV1>>;

    writeCounter(correlationId: string, counter: CounterV1): Promise<CounterV1>;
    
    writePerfMon(correlationId: string, counters: CounterV1[]): Promise<void>;

    clear(correlationId: string): Promise<void>;
}
```

## Download

Right now the only way to get the microservice is to check it out directly from github repository
```bash
git clone git@github.com:pip-services-infrastructure2/service-perfmon-node.git
```

Pip.Service team is working to implement packaging and make stable releases available for your 
as zip downloadable archieves.

## Run

Add **config.yaml** file to the root of the microservice folder and set configuration parameters.
As the starting point you can use example configuration from **config.example.yaml** file. 

Example of microservice configuration
```yaml
- descriptor: "pip-services-container:container-info:default:default:1.0"
  name: "service-perfmon"
  description: "Performance monitor microservice"

- descriptor: "pip-services-commons:logger:console:default:1.0"
  level: "trace"

- descriptor: "service-perfmon:persistence:memory:default:1.0"

- descriptor: "service-perfmon:controller:default:default:1.0"

- descriptor: "service-perfmon:service:http:default:1.0"
  connection:
    protocol: "http"
    host: "0.0.0.0"
    port: 8080
```
 
For more information on the microservice configuration see [Configuration Guide](Configuration.md).

Start the microservice using the command:
```bash
node run
```

## Use

The easiest way to work with the microservice is to use client SDK. 
The complete list of available client SDKs for different languages is listed in the [Quick Links](#links)

If you use Node.js then you should add dependency to the client SDK into **package.json** file of your project
```javascript
{
    dependencies: {
        ...
        "client-perfmon-node": "^1.0.*"
        ...
    }
}
```

Inside your code get the reference to the client SDK
```javascript
var sdk = new require('client-perfmon-node');
```

Define client configuration parameters that match configuration of the microservice external API
```javascript
// Client configuration
var config = {
    connection: {
        protocol: 'http',
        host: 'localhost', 
        port: 8080
    }
};
```

Instantiate the client and open connection to the microservice
```javascript
// Create the client instance
var client = sdk.PerfMonHttpClientV1(config);

// Connect to the microservice\
try {
    await client.open(null);
    // Work with the microservice
    ...
} catch(err) {
    console.error('Connection to the microservice failed');
    console.error(err);
}

```

Now the client is ready to perform operations
```javascript
// Log a counter
let counter = await client.writeCounter(
    null,
    {
        name: "group.counter",
        type: 1,
        last: '123'
    }
);
```

```javascript
var now = new Date();

// Get the list system activities
let page = await client.readPerfMon(
    null,
    {
        group: "test"
    },
    {
        total: true,
        skip: 0, 
        take: 10  
    }
);
```    

## Acknowledgements

This microservice was created and currently maintained by *Sergey Seroukhov*.

