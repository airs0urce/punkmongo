
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
        options.maxTimeMS = params.query.options.timeout * 1000;
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
    if (params.query.pagination.pageNumber > pagesTotal) {
        params.query.pagination.pageNumber = pagesTotal;
        setSkipAndLimit(options, params);
    }

    

    const cursor = collection.find(filter, options);
    const records = [];
    const recordsTimestamps = [];

    let record;
    while (record = await cursor.next()) {
        records.push(mongoDocToString(record));

        if (ObjectID.isValid(record._id)) {
            recordsTimestamps.push(
                moment(ObjectID(record._id).getTimestamp()).format('YYYY-MM-DD HH:mm:ss')
            );
        } else {
            recordsTimestamps.push(false);
        }
    }


    const collectionDocumentsTotal = await collection.estimatedDocumentCount();

    cursor.rewind();
    const explainInfo = await cursor.explain();

    await a.delay(1000);


    return {
        collectionDocumentsTotal: collectionDocumentsTotal, 
        resultDocumentsTotal: resultDocumentsTotal,
        pagesTotal: pagesTotal,
        pageNumber: params.query.pagination.pageNumber,
        records: records,
        recordsTimestamps: recordsTimestamps,
        // timeCost: 
        explain: explainInfo
    }
}

function setSkipAndLimit(options, params) {
    const pageSize = params.query.pagination.pageSize;
    const pageNumber = params.query.pagination.pageNumber;

    options.skip = pageSize * (pageNumber - 1);
    options.limit = pageSize;
}
