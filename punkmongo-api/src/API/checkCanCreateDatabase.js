
const a = require('awaiting');
const mongoHelpers = require('../mongoHelpers');

// params.db
module.exports = async function (params, dbClient) {  
    const result = await mongoHelpers.checkCanCreateDatabase(params.db);
    return result;
}