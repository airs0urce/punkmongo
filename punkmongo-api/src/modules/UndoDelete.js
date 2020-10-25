const DBFactory = require('./DBFactory');
const SystemCollections = require('./SystemCollections');
const mongodb = require('mongodb');
const ObjectID = mongodb.ObjectID;
const config = require('../../../config');

class UndoDelete {
    static async backup(dbName, collectionName, id) {
        for (let collType in config.api.systemCollections) {
            const info = config.api.systemCollections[collType];
            if (dbName === info.db && collectionName === info.collection) {
                // don't backup punkmongo system collections
                return false;
            }
        }

        const coll = await SystemCollections.getUndoDelete();

        const dbClient = await DBFactory.connectMongo();
        const docForBackup = await dbClient.db(dbName)
            .collection(collectionName)
            .findOne({ _id: ObjectID(id) });
            
        const restoreId = new ObjectID();
        await coll.insertOne({
            _id: restoreId,
            d: new Date(),
            dbName: dbName,
            collectionName: collectionName, 
            document: docForBackup
        });

        return restoreId.toString();

    }

    static async restore(restoreId) {
        const coll = await SystemCollections.getUndoDelete();

        const backup = await coll.findOne({_id: ObjectID(restoreId)})

        if (backup) {
            const dbClient = await DBFactory.connectMongo();
            await dbClient.db(backup.dbName).collection(backup.collectionName).insertOne(backup.document);
            await coll.deleteOne({ _id: backup._id })
            return true;
        }
        return false;
    }
}


module.exports = UndoDelete;

