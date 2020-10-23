
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
        options.projection = params.query.options.projection;
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

    const cursor = collection.find(filter, options);
    const records = [];
    const recordsTimestamps = [];

    let record;
    while (record = await cursor.next()) {   
        const docItem = {
            id: (record._id ? record._id.toString(): null),
            timestamp: false,
            doc: mongoDocToString(record),
        }

        if (ObjectID.isValid(record._id)) {
            docItem.timestamp = moment(ObjectID(record._id).getTimestamp()).unix();
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






