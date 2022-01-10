
const a = require('awaiting');
const ApiError = require('../errors/ApiError');

const mongoHelpers = require('../modules/mongoHelpers');
const checkCanCreateDatabase = require('./checkCanCreateDatabase');

/*
params = {
    db: 'db_name',
    collection: 'collection_name',
    capped: {
        enable: true,
        options: {
            max: 1000,
            size: 104857600
        }
    },
    collation: {
        enable: true,
        options: {
            locale: 'simple',
            strength: 3,
            caseLevel: false,
            caseFirst: 'off',
            numericOrdering: false,
            alternate: 'non-ignorable',
            maxVariable: 'punct',
            backwards: false,
        }
    }
}
*/
const availableCollationOptions = [
    'locale', 'caseLevel', 
    'caseFirst', 'strength', 
    'numericOrdering', 'alternate', 
    'maxVariable', 'backwards'
];

module.exports = async function (params, mongoClient) {  
    const db = mongoClient.db(params.db);

    let checkResult;

    const dbListResult = await mongoClient.db('admin').admin().listDatabases();
    const dbAlreadyExists = !!(dbListResult.databases.find((database) => {
        return database.name === params.db;
    }));

    if (!dbAlreadyExists) {
        checkResult = await checkCanCreateDatabase({db: params.db}, mongoClient);
        if (!checkResult.canCreate) {
            throw new ApiError(checkResult.reason, 1);
        }
    }
    
    checkResult = await mongoHelpers.checkCanCreateCollection(params.db, params.collection);
    if (!checkResult.canCreate) {
        throw new ApiError(checkResult.reason, 2);
    }
    
    const collectionOptions = {}

    if (params.capped.enable) {
        collectionOptions.capped = true;
        // The size of the capped collection in bytes.
        collectionOptions.size = params.capped.options.size; 
        if (params.capped.options.max) {
            // The maximum number of documents in the capped collection.
            collectionOptions.max = params.capped.options.max; 
        }
    }
    if (params.collation.enable) {
        collectionOptions.collation = {};
        for (let option in params.collation.options) {
            if (! availableCollationOptions.includes(option)) {
                throw ApiError(`Invalid collation option "${option}"`, ApiError.ERROR_INPUT);
            }

            collectionOptions.collation[option] = params.collation.options[option];
        }
    }
    try {
        await db.createCollection(params.collection, collectionOptions);    
    } catch (e) {
        throw new ApiError(e.message, 3);
    }

    return {}
}