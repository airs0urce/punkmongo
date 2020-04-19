
const a = require('awaiting');
const ObjectID = require('mongodb').ObjectID;
const moment = require('moment');
const { EJSON } = require('bson');

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

  const cursor = collection.find(params.filter, options);
  const records = [];
  let record;
  while (record = await cursor.next()) {
    records.push(EJSON.serialize(record));
  }

  const countOptions = {};
  if (params.query.options.limit > 0) {
    countOptions.limit = params.query.options.limit;
  }
  const documentsTotal = await collection.countDocuments(params.filter, countOptions);


  const recordsTimestamps = records.map((record) => {
    if (ObjectID.isValid(record._id)) {
      return moment(ObjectID(record._id).getTimestamp()).format('YYYY-MM-DD HH:mm:ss');
    } else {
      return false;
    }
  });

  return {
    pagesTotal: Math.ceil(documentsTotal / pageSize),
    pageNumber: pageNumber,
    records: records,
    recordsTimestamps: recordsTimestamps,
  }
}


