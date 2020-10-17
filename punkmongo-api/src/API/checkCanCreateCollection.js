
const a = require('awaiting');
const utils = require('../utils');
const mongoHelpers = require('../mongoHelpers');

// params.db
// params.collection
module.exports = async function (params, dbClient) {  

    const response = {
        canCreate: true,
        reason: null
    };

    params.collection = params.collection.trim();

    // check if name is empty
    if (params.collection == '') {
        response.canCreate = false;
        response.reason = `Collection name can't be empty`;
        return response;
    }

    // check if collection already exists
    const db = dbClient.db(params.db);
    const cursor = await db.listCollections({name: params.collection}, {nameOnly: true});
    const collection = await cursor.next();
    if (collection) {
        response.canCreate = false;
        response.reason = `Collection "${params.collection}" already exists in database ${params.db}`;
        return response;
    }
    
    // check if collection name is valid
    const validationRes = await mongoHelpers.validateCollectionName(params.db, params.collection);
    if (!validationRes.val) {
        response.canCreate = false;
        response.reason = validationRes.reason;
        return response;
    }
    

    return response;
}