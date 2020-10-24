
const a = require('awaiting')
    , mongodb = require('mongodb')
    , ObjectID = mongodb.ObjectID
    , moment = require('moment')
    , util = require('util')
    , vm = require('vm')
    , ejsonParser = require('ejson-shell-parser').default
    , mongoDocToString = require('../mongoDocToString')
;    


/*
{
    params.db - database
    params.collection - collection
    params.query - {
        filter: {}, 
        options: {
        sort: {}, 
        projection: {}, 
        limit: 0, 
        timeout: 0, 
    }
    pagination: {pageSize: 10, pageNumber: 1}
}

*/
module.exports = async function (params, dbClient) {  
    const collection = dbClient.db(params.db).collection(params.collection);

    let resultDocumentsTotal;
    let pagesTotal;

    const options = {};
    if (params.query.options.sort) {
        options.sort = params.query.options.sort;
    }
    if (params.query.options.projection) {
        options.projection = makeSureIncludeUniqueIdInProjection(
            params.query.options.projection, 
            params.db, 
            params.collection
        );
    }
    if (params.query.options.timeout) {
        options.maxTimeMS = params.query.options.timeout;
    }

    const filter = ejsonParser(params.query.filter, {loose: true, allowComments: false});
    
    if (!params.query.pagination.pageNumber) {
        params.query.pagination.pageNumber = 1;
    }
    setSkipAndLimit(options, params);

    const countOptions = {};
    if (params.query.options.limit > 0) {
        countOptions.limit = params.query.options.limit;
    }
    resultDocumentsTotal = await collection.countDocuments(filter, countOptions);
    pagesTotal = Math.ceil(resultDocumentsTotal / params.query.pagination.pageSize);
    if (pagesTotal === 0) {
        pagesTotal = 1;
    }

    if (params.query.pagination.pageNumber > pagesTotal) {
        params.query.pagination.pageNumber = pagesTotal;
        setSkipAndLimit(options, params);
    }

    let shouldRemoveUniqueIdFromResultObject = false;
    let uniqueIdField = (params.db === 'local' && params.collection === 'oplog.rs') ? 'ui': '_id';
    if (0 === params.query.options.projection[uniqueIdField]) {
        // it means client asked to remove uniqueIdField in projection, 
        // but we included it in "makeSureIncludeUniqueIdInProjection" function

        // let's remove this field from result object to not show uniqueIdField for end user
        shouldRemoveUniqueIdFromResultObject = true;
    }

    const cursor = collection.find(filter, options);
    const records = [];
    const recordsTimestamps = [];

    let record;
    while (record = await cursor.next()) {   
        let timestamp = false;
        if (ObjectID.isValid(record._id)) {
            timestamp = moment(ObjectID(record._id).getTimestamp()).unix();
        }

        let uniqueRecordIdValue = record[uniqueIdField];
        if (shouldRemoveUniqueIdFromResultObject) {
            delete record[uniqueIdField];
        }

        const docItem = {
            id: (uniqueRecordIdValue ? uniqueRecordIdValue.toString(): null),
            timestamp: timestamp,
            doc: mongoDocToString(record),
        }

        records.push(docItem);
    }


    const collectionDocumentsTotal = await collection.estimatedDocumentCount();

    cursor.rewind();
    const explainInfo = await cursor.explain();

    return {
        collectionDocumentsTotal: collectionDocumentsTotal, 
        resultDocumentsTotal: resultDocumentsTotal,
        pagesTotal: pagesTotal,
        pageNumber: params.query.pagination.pageNumber,
        records: records,
        explain: explainInfo
    }
}

function setSkipAndLimit(options, params) {
    const pageSize = params.query.pagination.pageSize;
    const pageNumber = params.query.pagination.pageNumber;

    options.skip = pageSize * (pageNumber - 1);
    
    if (params.query.options.limit !== false && params.query.options.limit < pageSize) {
        options.limit = params.query.options.limit - options.skip;
        if (options.limit > pageSize) {
            options.limit = pageSize;
        }
    } else {
        options.limit = pageSize;
    }

    if (params.query.options.limit !== false) {
        const diffRecordsAmount = (options.skip + options.limit) - params.query.options.limit;
        if (diffRecordsAmount > 0) {
            options.limit = options.limit - diffRecordsAmount;
        }
    }
    
}

function makeSureIncludeUniqueIdInProjection(projection, dbName, collectionName) {
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



