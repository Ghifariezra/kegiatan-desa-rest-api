import { resetDatabase } from './helpers/db.js';

export const mochaHooks = {
    async beforeAll() {
        this.timeout(30000);
        await resetDatabase();
    },
};