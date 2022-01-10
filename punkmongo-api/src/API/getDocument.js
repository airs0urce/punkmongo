
const a = require('awaiting')
    , ApiError = require('../errors/ApiError')
    , mongodb = require('mongodb')
    , ObjectID = mongodb.ObjectID
    , moment = require('moment')
    , mongoDocToString = require('../mongoDocToString')
    , mongoHelpers = require('../modules/mongoHelpers')
;

/*
params = {
    db: 'db_name',
    collection: 'collection_name',
    _id: '5f7ccd180e95b70d27a9b623',
    projection: {} // optional
}
*/

module.exports = async function (params, mongoClient) {  
    const collection = mongoClient.db(params.db).collection(params.collection);

    const options = {};
    if (params.projection) {
        options.projection = mongoHelpers.makeSureIncludeUniqueIdInProjection(
            params.projection, 
            params.db, 
            params.collection
        );
    }
    
    const docId = mongoHelpers.parse(params._id);

    const record = await collection.findOne({_id: docId}, options);

    if (! record) {
        throw new ApiError(`Record with ID "${docId}" doesn't exist in "${params.collection}" collection anymore`, 1);
    }

    const recordId = (record._id ? record._id: null)
    
    let timestamp = false;
    if (ObjectID.isValid(record._id)) {
        timestamp = moment(ObjectID(record._id).getTimestamp()).unix();
    }

    if (0 === params.projection['_id']) {
        delete record._id;        
    }
    
    return {
        document: {
            id: mongoHelpers.stringify(recordId),
            timestamp: timestamp,
            doc: mongoDocToString(record),
        }
    };
}