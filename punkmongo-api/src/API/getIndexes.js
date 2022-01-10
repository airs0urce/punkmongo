
const a = require('awaiting')
    , mongodb = require('mongodb')
    , ObjectID = mongodb.ObjectID
    , util = require('util')
;    


module.exports = async function (params, mongoClient) {  
    const collection = mongoClient.db(params.db).collection(params.collection);
    
    const indexes = await collection.indexes();
    
    return {
        indexes: indexes
    }
}