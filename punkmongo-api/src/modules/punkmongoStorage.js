const Datastore = require('nedb-promises')

const undoDeleteStore = Datastore.create(__dirname + '/../../nedb_store/punkmongo-undo-delete.db');

class punkmongoStorage {
    static async getUndoDelete() {
        await undoDeleteStore.ensureIndex({fieldName: 'expireAt', expireAfterSeconds: 0});
        return undoDeleteStore;
    }
}

module.exports = punkmongoStorage;