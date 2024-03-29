
const a = require('awaiting')
    , mongodb = require('mongodb')
    , ObjectID = mongodb.ObjectID
    , moment = require('moment')
    , util = require('util')
    , vm = require('vm')
    , mongoDocToString = require('../mongoDocToString')
    , mongoHelpers = require('../modules/mongoHelpers')
    , utils = require('../utils')
    , ApiError = require('../errors/ApiError')
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
module.exports = async function (params, mongoClient) {  
    const collection = mongoClient.db(params.db).collection(params.collection);

    let resultDocumentsTotal;
    let pagesTotal;

    const options = {};
    if (params.query.options.sort) {
        options.sort = params.query.options.sort;
    }
    if (params.query.options.projection) {
        options.projection = mongoHelpers.makeSureIncludeUniqueIdInProjection(
            params.query.options.projection, 
            params.db, 
            params.collection
        );
    }
    if (params.query.options.timeout) {
        options.maxTimeMS = params.query.options.timeout;
    }
console.log('1');
    try {
        filter = mongoHelpers.mongoShellToObject(params.query.filter);
console.log('2');        
    } catch (e) {
        throw new ApiError(`${e.message} Stack: ${e.stack}`, 1);
    }    
console.log('3');        
    if (!params.query.pagination.pageNumber) {
        params.query.pagination.pageNumber = 1;
    }
    setSkipAndLimit(options, params);

    const countOptions = {};
    if (params.query.options.limit > 0) {
        countOptions.limit = params.query.options.limit;
    }
    try {
        resultDocumentsTotal = await collection.countDocuments(filter, countOptions);
    } catch (e) {
        throw new ApiError(`Error: ${e.message}`, 2);
    }
    

    pagesTotal = Math.ceil(resultDocumentsTotal / params.query.pagination.pageSize);
    if (pagesTotal === 0) {
        pagesTotal = 1;
    }

    if (params.query.pagination.pageNumber > pagesTotal) {
        params.query.pagination.pageNumber = pagesTotal;
        setSkipAndLimit(options, params);
    }

    let findCursor;
    try {
        findCursor = collection.find(filter, options);
    } catch (e) {
        throw new ApiError(`Error: ${e.message}`, 3);
    }

    
    const records = [];
    const recordsTimestamps = [];

    let record;
    let recordIndex = 0;
    while (record = await findCursor.next()) {   
        let timestamp = false;
        if (ObjectID.isValid(record._id)) {
            timestamp = moment(ObjectID(record._id).getTimestamp()).unix();
        }

        const docId = mongoHelpers.stringify(record._id);

        if (0 === params.query.options.projection['_id']) {
            // it means client asked to remove "_id" in projection, 
            // but we included it in "mongoHelpers.makeSureIncludeUniqueIdInProjection" function

            // let's remove this field from result object to not show "_id" for end user
            delete record['_id'];
        }

        const docItem = {
            id: docId,
            timestamp: timestamp,
            doc: mongoDocToString(record),
        }

        records.push(docItem);
    }
console.log(records);
    const collectionDocumentsTotal = await collection.estimatedDocumentCount();

    findCursor.rewind();
    const explainInfo = await findCursor.explain();

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





