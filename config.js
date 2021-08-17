
module.exports = {
    api: {
        domain: 'punkmongolocal.com',
        host: '0.0.0.0',
        port: 4000,
        auth: {
            username: 'admin',
            password: 'admin'
        },
        mongodb: {
            host: '127.0.0.1',
            port: 27017
        },
        systemCollections: {
            undoDelete: {
                db: 'local',
                collection: 'punkmongo_undo_delete'
            }
        }
    },
    client: {
        protocol: 'http://',
        host: '127.0.0.1',
        port: 4000,
    }

}
