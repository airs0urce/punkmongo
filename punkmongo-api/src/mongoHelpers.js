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

}


module.exports = mongoHelpers;

