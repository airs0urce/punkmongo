
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

    let {pageSize, pageNumber} = params.query.pagination;
    if (!pageNumber) {
        pageNumber = 1;
    }

    options.skip = pageSize * (pageNumber - 1);
    options.limit = pageSize;

    const filter = ejsonParser(params.query.filter, {loose: true, allowComments: false});
    
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

    const countOptions = {};
    if (params.query.options.limit > 0) {
        countOptions.limit = params.query.options.limit;
    }

    const [documentsTotal, collectionDocumentsTotal] = await Promise.all([
        collection.countDocuments(filter, countOptions),
        collection.estimatedDocumentCount()
    ]);

    cursor.rewind();
    const explainInfo = await cursor.explain();

    return {
        collectionDocumentsTotal: collectionDocumentsTotal, 
        documentsTotal: documentsTotal,
        pagesTotal: Math.ceil(documentsTotal / pageSize),
        pageNumber: pageNumber,
        records: records,
        recordsTimestamps: recordsTimestamps,
        // timeCost: 
        explain: explainInfo
    }
}


