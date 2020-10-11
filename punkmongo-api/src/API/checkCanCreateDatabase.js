
const a = require('awaiting');
const ServerError = require('koa-jsonrpc').ServerError;
const utils = require('../utils');


module.exports = async function (params, dbClient) {  
    // params.dbName

    const response = {
        canCreate: true,
        reason: null
    };

    // check if name is empty
    if (params.dbName.trim() == '') {
        response.canCreate = false;
        response.reason = `Enter database name`;
        return response;
    }

    // check if database already exists
    const result = await dbClient.db('admin').admin().listDatabases();
    const databases = result.databases.map(db => db.name);
    
    for (let database of databases) {
        if (database == params.dbName) {
            response.canCreate = false;
            response.reason = `Database "${params.dbName}" already exists`;
            return response;
        }
        if (database.toLowerCase() == params.dbName.toLowerCase()) {
            response.canCreate = false;
            response.reason = `Database "${params.dbName}" already exists with different letter case: "${database}"`;
            return response;
        }
    }

    // check if database name is valid
    const validationRes = await utils.validateDatabaseName(params.dbName);
    if (!validationRes.val) {
        response.canCreate = false;
        response.reason = validationRes.reason;
        return response;
    }

    return response;
}