const DBFactory = require('./DBFactory');
const mongoHelpers = require('./mongoHelpers');
const config = require('../../../config');

class SystemCollections {
    static async getUndoDelete() {
        const undoDelete = config.api.systemCollections.undoDelete;

        const dbClient = await DBFactory.connectMongo();

        const exists = await mongoHelpers.doesCollectionExist(undoDelete.db, undoDelete.collection);
        if (!exists) {
            const dbLocal = dbClient.db(undoDelete.db);
            await dbLocal.createCollection(undoDelete.collection);
            // expireAfterSeconds is 0 and this is correct. 
            // This way docuemnt will expire at time in expireAt field
            await dbLocal.createIndex(undoDelete.collection, {expireAt: 1}, {"expireAfterSeconds": 0});
        }

        return dbClient.db('local').collection(undoDelete.collection);
    }

}


module.exports = SystemCollections;

