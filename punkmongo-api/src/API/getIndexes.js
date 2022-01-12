
const a = require('awaiting')
    , mongodb = require('mongodb')
    , ObjectID = mongodb.ObjectID
    , util = require('util')
;    


module.exports = async function (params, mongoClient) {  
    const collection = mongoClient.db(params.db).collection(params.collection);
    const options = await collection.options();
    let indexes;
    
    if (options.viewOn) {
        // this is a view, no need to get indexes
        indexes = []
    } else {
        indexes = await collection.indexes();
    }

    return {
        indexes: indexes
    }
}