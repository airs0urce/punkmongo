const DBFactory = require('./DBFactory');
const _ = require('lodash');


class mongoHelpers {
    static async validateDatabaseName(dbName) {
        const dbClient = await DBFactory.connectMongo();
        try {
            const res = await dbClient.db(dbName).stats();
        } catch (e) {
            if (e.codeName == 'InvalidNamespace') {
                return {
                    val: false,
                    reason: `Invalid database name: "${dbName}"`
                };
            } else if (e.message.includes('database name')) {
                return {
                    val: false,
                    reason: _.capitalize(e.message)
                };
            } else {
                throw e;
            }
        }
        return {
            val: true,
            reason: null
        };
    }

    static async validateCollectionName(dbName, collName) {
        const dbClient = await DBFactory.connectMongo();       
        
        try {
            dbClient.db(dbName).collection(collName);
        } catch (e) {
            return {
                val: false,
                reason: e.message
            };
        }
        
        return {
            val: true,
            reason: null
        };
    }

    static async checkCanCreateCollection(dbName, collectionName) {
        const dbClient = await DBFactory.connectMongo();

        const result = {
            canCreate: true,
            reason: null
        };

        collectionName = collectionName.trim();

        // check if name is empty
        if (collectionName == '') {
            result.canCreate = false;
            result.reason = `Collection name can't be empty`;
            return result;
        }

        // check if collection already exists
        const db = dbClient.db(dbName);
        const cursor = await db.listCollections({name: collectionName}, {nameOnly: true});
        const collection = await cursor.next();
        if (collection) {
            result.canCreate = false;
            result.reason = `Collection "${collectionName}" already exists in database ${dbName}`;
            return result;
        }
        
        // check if collection name is valid
        const validationRes = await mongoHelpers.validateCollectionName(dbName, collectionName);
        if (!validationRes.val) {
            result.canCreate = false;
            result.reason = validationRes.reason;
            return result;
        }
        

        return result;
    }

    static async checkCanCreateDatabase(dbName) {
        const dbClient = await DBFactory.connectMongo();
        
        const result = {
            canCreate: true,
            reason: null
        };
        
        dbName = dbName.trim();

        // check if name is empty
        if (dbName == '') {
            result.canCreate = false;
            result.reason = `Database name can't be empty`;
            return result;
        }

        // check if database already exists
        const queryResult = await dbClient.db('admin').admin().listDatabases();
        const databases = queryResult.databases.map(db => db.name);
        
        for (let database of databases) {
            if (database == dbName) {
                result.canCreate = false;
                result.reason = `Database "${dbName}" already exists`;
                return result;
            }
            if (database.toLowerCase() == dbName.toLowerCase()) {
                result.canCreate = false;
                result.reason = `Database "${dbName}" already exists with different letter case: "${database}"`;
                return result;
            }
        }

        // check if database name is valid
        const validationRes = await mongoHelpers.validateDatabaseName(dbName);
        if (!validationRes.val) {
            result.canCreate = false;
            result.reason = validationRes.reason;
            return result;
        }

        return result;
    }

    static makeSureIncludeUniqueIdInProjection(projection, dbName, collectionName) {
        const newProjection = {...projection};
        /*
        Here is a little magic.

        If client set projection the way that _id field removed, we should not allow it 
        and make sure that _id returned anyway. We will get that field from DB anyway and then 
        return it in another array together with records.

        Why we do it? 
        1) If _id field excluded then user can't edit or delete document. 
        Sure, we can just disable ability to edit and delete result documents in this, 
        but I think this is bad design of interface for end-user because it introduces 
        inconsistencies in user interface (it it takes time to understand why you got those inconsistencies).
        
        2) Also we need some unique id for each document on client side (for ":key" in "v-for")
        
        ===

        Also there is special case for "oplog.rs" collection in "local" database.
        As I see this is the only collection where we don't have "_id" field.
        But there is "ui" field of "UUID" type. This is unique record id, so we can use this field instead of "_id"
        */

        if (dbName === 'local' && collectionName === 'oplog.rs') {
            // ui - unique id.
            // if "ui" was excluded, then let's ignore this exclusion
            const nonIdIncludesExists = Object.keys(newProjection).filter((key) => {
                return (key != 'ui' && newProjection[key] === 1)
            }).length;

            if (newProjection.ui === 0 || nonIdIncludesExists > 0) {
                newProjection.ui = 1;
            } else {
                delete newProjection.ui;
            }
        } else {
            // _id will not be removed from results until you exclude it explicitly, 
            // so let's only check if it was excluded explicitly:
            if (newProjection._id === 0) {
                // if "_id" was excluded, then let's ignore this exclusion
                const nonIdIncludesExists = Object.keys(newProjection).filter((key) => {
                    return (key != '_id' && newProjection[key] === 1)
                }).length;

                if (nonIdIncludesExists > 0) {
                    newProjection._id = 1;
                } else {
                    delete newProjection._id;
                }
            }
        }

        return newProjection;
    }

}


module.exports = mongoHelpers;

