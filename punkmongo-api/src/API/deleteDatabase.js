
const a = require('awaiting');
const ApiError = require('../errors/ApiError');

/*
params = {
    db: 'db_name',
}
*/

module.exports = async function (params, mongoClient) {  
    const db = mongoClient.db(params.db);
    await db.dropDatabase();
    return {}
}