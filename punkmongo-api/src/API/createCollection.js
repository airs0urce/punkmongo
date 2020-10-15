
const a = require('awaiting');
const {ServerError, InvalidParamsError} = require('koa-jsonrpc');

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

module.exports = async function (params, dbClient) {  
    const db = dbClient.db(params.db);

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
                throw new InvalidParamsError(`Invalid collation option "${option}"`);
            }

            collectionOptions.collation[option] = params.collation.options[option];
        }
    }

    await db.createCollection(params.collection, collectionOptions);    

    return {}
}