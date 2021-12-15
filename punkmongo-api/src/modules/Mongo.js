"use strict";

const config = require('../../../config')
    , mongodb = require('mongodb')
    , a = require('awaiting')
;

const clientInstances = {
    mongo: null,
};

class Mongo {
    static async getInstance() {
        if (clientInstances.mongo) {
            return clientInstances.mongo;
        }

        clientInstances.mongo = await _connectMongo();
        while (! clientInstances.mongo) {
            console.log('[MongoDB] Reconnecting after 3 sec...');
            await a.delay(3000); //reconnect delay
            clientInstances.mongo = await _connectMongo();
        }
        return clientInstances.mongo;
    }
}

async function _connectMongo() {
    let client = new mongodb.MongoClient(
        'mongodb://' + config.api.mongodb.host + ':' + config.api.mongodb.port,
        {
            socketTimeoutMS:  350 * 60 * 1000, // 350 min.    
        }
    );
    try {
        await client.connect();
        return client;
    } catch (e) {
        if (e.name == 'MongoNetworkError' || e.name == 'MongoServerSelectionError') {
            console.error('[MongoDB] Error connecting: ', e.message);
            console.error(e.reason);
            return null;
        } else {
            throw e;
        }
    }
}

module.exports = Mongo;
