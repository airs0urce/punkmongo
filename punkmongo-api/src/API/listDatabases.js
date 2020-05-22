const a = require('awaiting');

module.exports = async function (params, dbClient) {
    const result = await dbClient.db('admin').admin().listDatabases();

    let i;

    const getStatsPromises = [];
    for (i = 0; i < result.databases.length; i++) {
        getStatsPromises.push(dbClient.db(result.databases[i].name).stats())
    }

    const getStatsResults = await Promise.all(getStatsPromises);

    for (i = 0; i < result.databases.length; i++) {
        result.databases[i].stats = {
            avgObjSize: getStatsResults[i].avgObjSize,
            collections: getStatsResults[i].collections,
            dataSize: getStatsResults[i].dataSize,
            fsTotalSize: getStatsResults[i].fsTotalSize,
            fsUsedSize: getStatsResults[i].fsUsedSize,
            indexSize: getStatsResults[i].indexSize,
            indexes: getStatsResults[i].indexes,
            objects: getStatsResults[i].objects,
            storageSize: getStatsResults[i].storageSize,
            views: getStatsResults[i].views,
        };
    }

    return result.databases;
}