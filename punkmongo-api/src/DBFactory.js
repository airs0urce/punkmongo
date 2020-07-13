"use strict";

const config = require('../../config')
    , mongodb = require('mongodb')
    , a = require('awaiting')
;

const clientInstances = {
    mongo: null,
};

class DBFactory {
    
    /** 
    * =====================================================
    * ASYNC variants of getting database connection objects
    * The only way to get connections when script is not connected yet.
    * =====================================================
    */

   
    static async connectMongo() {
        if (clientInstances.mongo) {
            return clientInstances.mongo;
        }
        try {
            clientInstances.mongo = await mongodb.MongoClient.connect(
                'mongodb://' + config.api.mongodb.host + ':' + config.api.mongodb.port, 
                {
                    poolSize: 10, 
                    useNewUrlParser: true,
                    useUnifiedTopology: true,
                    socketTimeoutMS:  350 * 60 * 1000, // 350 min. 
                }
            );
            return clientInstances.mongo;
        } catch (e) {
            if (e.name == 'MongoNetworkError' || e.name == 'MongoServerSelectionError') {
                console.error('[MongoDB] Error connecting: ', e.message);
                // probably mongodb is not up yet, let's try again to make sure 
                // we connected when mongodb is up again
                console.log('[MongoDB] Reconnecting after 1 sec...');
                await a.delay(3000); //reconnect delay
                return DBFactory.connectMongo();
            } else {
                throw e;
            }
        }       
    }


    /** 
    * =========================================================================
    * SYNC variants of getting database connection objects. 
    * Only possible to use it when db connected already initialised using ASYNC function 
    * or it will throw error otherwise.
    * =========================================================================
    */

    static get mongo() { 
        if (clientInstances.mongo === null) {
            throw Error(`[DBFactory, MongoDB] Can't get mongo client instance because it's not ready. 
                Call async "await DBFactory.connectMongo()" and then you can use sync "DBFactory.mongo"`);
        }
        return clientInstances.mongo;
    }
}

module.exports = DBFactory;


