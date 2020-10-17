
const a = require('awaiting');
const mongoHelpers = require('../mongoHelpers');

// params.db
module.exports = async function (params, dbClient) {  
   
    const response = {
        canCreate: true,
        reason: null
    };
    
    params.db = params.db.trim();

    // check if name is empty
    if (params.db == '') {
        response.canCreate = false;
        response.reason = `Database name can't be empty`;
        return response;
    }

    // check if database already exists
    const result = await dbClient.db('admin').admin().listDatabases();
    const databases = result.databases.map(db => db.name);
    
    for (let database of databases) {
        if (database == params.db) {
            response.canCreate = false;
            response.reason = `Database "${params.db}" already exists`;
            return response;
        }
        if (database.toLowerCase() == params.db.toLowerCase()) {
            response.canCreate = false;
            response.reason = `Database "${params.db}" already exists with different letter case: "${database}"`;
            return response;
        }
    }

    // check if database name is valid
    const validationRes = await mongoHelpers.validateDatabaseName(params.db);
    if (!validationRes.val) {
        response.canCreate = false;
        response.reason = validationRes.reason;
        return response;
    }

    return response;
}