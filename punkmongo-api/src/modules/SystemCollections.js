const DBFactory = require('./DBFactory');
const mongoHelpers = require('./mongoHelpers');
const config = require('../../../config');

class SystemCollections {
    static async getUndoDelete() {
        const undoDelete = config.api.systemCollections.undoDelete;

        const dbClient = await DBFactory.connectMongo();

        const exists = await mongoHelpers.isCollectionExist(undoDelete.db, undoDelete.collection);
        if (!exists) {
            const dbLocal = dbClient.db(undoDelete.db);
            await dbLocal.createCollection(undoDelete.collection);
            await dbLocal.createIndex(undoDelete.collection, {d: 1}, {"expireAfterSeconds": 30});
        }

        return dbClient.db('local').collection(undoDelete.collection);
    }

}


module.exports = SystemCollections;

