const Mongo = require('./Mongo');
const punkmongoStorage = require('./punkmongoStorage');
const mongoHelpers = require('./mongoHelpers');
const mongodb = require('mongodb');
const ObjectID = mongodb.ObjectID;
const config = require('../../../config');
const moment = require('moment');

class UndoDelete {
    static async backup(dbName, collectionName, id, expireAfterSec = 60) {
        const undoDeleteStore = await punkmongoStorage.getUndoDelete();

        const mongoClient = await Mongo.getInstance();

        const docForBackup = await mongoClient.db(dbName)
            .collection(collectionName)
            .findOne({ _id: id });

console.log(docForBackup);
        if (! docForBackup) {
            return null;
        }

        const expireAt = moment().add(expireAfterSec, 'seconds').toDate();

        const insertedDoc = await undoDeleteStore.insert({
            expireAt: expireAt,
            dbName: dbName,
            collectionName: collectionName, 
            document: mongoHelpers.stringify(docForBackup)
        });

        return insertedDoc._id;

    }

    static async updateExpiration(restoreId, expireAfterSec = 10) {
        const undoDeleteStore = await punkmongoStorage.getUndoDelete();
        
        const expireAt = moment().add(expireAfterSec, 'seconds').toDate();

        await undoDeleteStore.update(
            {_id: restoreId},
            {$set: {
                expireAt: expireAt
            }}
        );
    }

    static async restore(restoreId) {
        const undoDeleteStore = await punkmongoStorage.getUndoDelete();

        const backup = await undoDeleteStore.findOne({_id: restoreId})

        if (backup) {
            const mongoClient = await Mongo.getInstance();
            const restoreDoc = mongoHelpers.parse(backup.document);
            await mongoClient.db(backup.dbName).collection(backup.collectionName).insertOne(restoreDoc);
            await undoDeleteStore.remove({ _id: backup._id })
            return true;
        }
        return false;
    }
}



//UndoDelete.backup('nearby_hippie', 'users', id, expireAfterSec = 60)

module.exports = UndoDelete;

