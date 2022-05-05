"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerfMonServiceFactory = void 0;
const pip_services3_components_nodex_1 = require("pip-services3-components-nodex");
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const PerfMonMemoryPersistence_1 = require("../persistence/PerfMonMemoryPersistence");
const PerfMonMongoDbPersistence_1 = require("../persistence/PerfMonMongoDbPersistence");
const PerfMonController_1 = require("../logic/PerfMonController");
const PerfMonHttpServiceV1_1 = require("../services/version1/PerfMonHttpServiceV1");
class PerfMonServiceFactory extends pip_services3_components_nodex_1.Factory {
    constructor() {
        super();
        this.registerAsType(PerfMonServiceFactory.MemoryPersistenceDescriptor, PerfMonMemoryPersistence_1.PerfMonMemoryPersistence);
        this.registerAsType(PerfMonServiceFactory.MongoDbPersistenceDescriptor, PerfMonMongoDbPersistence_1.PerfMonMongoDbPersistence);
        this.registerAsType(PerfMonServiceFactory.ControllerDescriptor, PerfMonController_1.PerfMonController);
        this.registerAsType(PerfMonServiceFactory.HttpServiceDescriptor, PerfMonHttpServiceV1_1.PerfMonHttpServiceV1);
    }
}
exports.PerfMonServiceFactory = PerfMonServiceFactory;
PerfMonServiceFactory.Descriptor = new pip_services3_commons_nodex_1.Descriptor("service-perfmon", "factory", "default", "default", "1.0");
PerfMonServiceFactory.MemoryPersistenceDescriptor = new pip_services3_commons_nodex_1.Descriptor("service-perfmon", "persistence", "memory", "*", "1.0");
PerfMonServiceFactory.MongoDbPersistenceDescriptor = new pip_services3_commons_nodex_1.Descriptor("service-perfmon", "persistence", "mongodb", "*", "1.0");
PerfMonServiceFactory.ControllerDescriptor = new pip_services3_commons_nodex_1.Descriptor("service-perfmon", "controller", "default", "*", "1.0");
PerfMonServiceFactory.HttpServiceDescriptor = new pip_services3_commons_nodex_1.Descriptor("service-perfmon", "service", "http", "*", "1.0");
//# sourceMappingURL=PerfMonServiceFactory.js.map