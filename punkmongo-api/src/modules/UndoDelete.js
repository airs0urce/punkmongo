const DBFactory = require('./DBFactory');
const SystemCollections = require('./SystemCollections');
const mongodb = require('mongodb');
const ObjectID = mongodb.ObjectID;
const config = require('../../../config');
const moment = require('moment');

class UndoDelete {
    static async backup(dbName, collectionName, id, expireAfterSec = 60) {
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
        const expireAt = moment().add(expireAfterSec, 'seconds').toDate();

        await coll.insertOne({
            _id: restoreId,
            expireAt: expireAt,
            dbName: dbName,
            collectionName: collectionName, 
            document: docForBackup
        });

        return restoreId.toString();

    }

    static async updateExpiration(restoreId, expireAfterSec = 10) {
        const coll = await SystemCollections.getUndoDelete();
        
        const expireAt = moment().add(expireAfterSec, 'seconds').toDate();

        await coll.updateOne(
            {_id: ObjectID(restoreId)},
            {$set: {
                expireAt: expireAt
            }}
        );
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

