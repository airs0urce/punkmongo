
const a = require('awaiting');
const ApiError = require('../errors/ApiError');

/*
params = {
    db: 'db_name',
}
*/

module.exports = async function (params, dbClient) {  
    const db = dbClient.db(params.db);
    await db.dropDatabase();
    return {}
}