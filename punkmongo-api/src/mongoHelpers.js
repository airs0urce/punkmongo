const DBFactory = require('./DBFactory');
const _ = require('lodash');

module.exports = {
    async validateDatabaseName(dbName) {
        const dbClient = await DBFactory.connectMongo();
        try {
            const res = await dbClient.db(dbName).stats();
        } catch (e) {
            if (e.codeName == 'InvalidNamespace') {
                return {
                    val: false,
                    reason: `Invalid database name: "${params.dbName}"`
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
    },

    async validateCollectionName(dbName, collName) {
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

}