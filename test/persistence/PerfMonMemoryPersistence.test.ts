import { PerfMonMemoryPersistence } from '../../src/persistence/PerfMonMemoryPersistence';
import { PerfMonPersistenceFixture } from './PerfMonPersistenceFixture';

suite('PerfMonMemoryPersistence', ()=> {
    let persistence: PerfMonMemoryPersistence;
    let fixture: PerfMonPersistenceFixture;

    suiteSetup(async () => {
        persistence = new PerfMonMemoryPersistence();
        fixture = new PerfMonPersistenceFixture(persistence);
    });
    
    setup(async () => {
        await persistence.clear(null);
    });

    test('Read and Write', async () => {
        await fixture.testReadWrite();
    });

});