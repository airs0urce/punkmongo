const Mongo = require('./Mongo');
const _ = require('lodash');
const EJSON = require('bson').EJSON;
const vm = require('vm');
const mongodb = require('mongodb');


class mongoHelpers {
    static async validateDatabaseName(dbName) {
        const mongoClient = await Mongo.getInstance();
        try {
            const res = await mongoClient.db(dbName).stats();
        } catch (e) {
            if (e.codeName == 'InvalidNamespace') {
                return {
                    val: false,
                    reason: `Invalid database name: "${dbName}"`
                };
            } else if (e.message.includes('database name')) {
                return {
                    val: false,
                    reason: _.capitalize(e.message)
                };
            } else {
                throw e;
            }
        }
        return {
            val: true,
            reason: null
        };
    }

    static async validateCollectionName(dbName, collName) {
        const mongoClient = await Mongo.getInstance();
        
        try {
            mongoClient.db(dbName).collection(collName);
        } catch (e) {
            return {
                val: false,
                reason: e.message
            };
        }
        
        return {
            val: true,
            reason: null
        };
    }

    static async checkCanCreateCollection(dbName, collectionName) {
        const mongoClient = await Mongo.getInstance();

        const result = {
            canCreate: true,
            reason: null
        };

        collectionName = collectionName.trim();

        // check if name is empty
        if (collectionName == '') {
            result.canCreate = false;
            result.reason = `Collection name can't be empty`;
            return result;
        }

        // check if collection already exists
        const collExists = await mongoHelpers.doesCollectionExist(dbName, collectionName);
        if (collExists) {
            result.canCreate = false;
            result.reason = `Collection "${collectionName}" already exists in database ${dbName}`;
            return result;
        }
        
        // check if collection name is valid
        const validationRes = await mongoHelpers.validateCollectionName(dbName, collectionName);
        if (!validationRes.val) {
            result.canCreate = false;
            result.reason = validationRes.reason;
            return result;
        }
        

        return result;
    }

    static async checkCanCreateDatabase(dbName) {
        const mongoClient = await Mongo.getInstance();
        
        const result = {
            canCreate: true,
            reason: null
        };
        
        dbName = dbName.trim();

        // check if name is empty
        if (dbName == '') {
            result.canCreate = false;
            result.reason = `Database name can't be empty`;
            return result;
        }

        // check if database already exists
        const queryResult = await mongoClient.db('admin').admin().listDatabases();
        const databases = queryResult.databases.map(db => db.name);
        
        for (let database of databases) {
            if (database == dbName) {
                result.canCreate = false;
                result.reason = `Database "${dbName}" already exists`;
                return result;
            }
            if (database.toLowerCase() == dbName.toLowerCase()) {
                result.canCreate = false;
                result.reason = `Database "${dbName}" already exists with different letter case: "${database}"`;
                return result;
            }
        }

        // check if database name is valid
        const validationRes = await mongoHelpers.validateDatabaseName(dbName);
        if (!validationRes.val) {
            result.canCreate = false;
            result.reason = validationRes.reason;
            return result;
        }

        return result;
    }

    static async doesCollectionExist(dbName, collectionName) {
        const mongoClient = await Mongo.getInstance();
        const db = mongoClient.db(dbName);
        const cursor = await db.listCollections({name: collectionName}, {nameOnly: true});
        const collection = await cursor.next();
        cursor.close();
        if (collection) {
            return true
        }
        return false;
    }

    static makeSureIncludeUniqueIdInProjection(projection, dbName, collectionName) {
        const newProjection = {...projection};
        /*
        Here is a little magic.

        If client set projection the way that _id field removed, we should not allow it 
        and make sure that _id returned anyway. We will get that field from DB anyway and then 
        return it in another array together with records.

        Why we do it? 
        1) If _id field excluded then user can't edit or delete document. 
        Sure, we can just disable ability to edit and delete result documents in this, 
        but I think this is bad design of interface for end-user because it introduces 
        inconsistencies in user interface (it it takes time to understand why you got those inconsistencies).
        
        2) Also we need some unique id for each document on client side (for ":key" in "v-for")
        
        */

   
        // _id will not be removed from results until you exclude it explicitly, 
        // so let's only check if it was excluded explicitly:
        if (newProjection._id === 0) {
            // if "_id" was excluded, then let's ignore this exclusion
            const nonIdIncludesExists = Object.keys(newProjection).filter((key) => {
                return (key != '_id' && newProjection[key] === 1)
            }).length;

            if (nonIdIncludesExists > 0) {
                newProjection._id = 1;
            } else {
                delete newProjection._id;
            }
        }

        return newProjection;
    }

    static stringify(obj) {
        return EJSON.stringify(obj, {relaxed: false});
    } 

    static parse(string) {
        const object = EJSON.parse(string, {relaxed: false});
        return object;
    }

    static mongoShellToObject(mongoString) {
        /*
        HELP FROM Mongo Shell:

        b = new BinData(subtype,base64str)  create a BSON BinData value
        b.subtype()                         the BinData subtype (0..255)
        b.length()                          length of the BinData data in bytes
        b.hex()                             the data as a hex encoded string
        b.base64()                          the data as a base 64 encoded string
        b.toString()
            
        \x02 Binary (Old) - This used to be the default subtype, but was deprecated in favor of \x00. 
        Drivers and tools should be sure to handle \x02 appropriately. 
        The structure of the binary data (the byte* array in the binary non-terminal) must be 
        an int32 followed by a (byte*). The int32 is the number of bytes in the repetition.

        \x03 UUID (Old) - This used to be the UUID subtype, but was deprecated in favor of \x04. 
        Drivers and tools for languages with a native UUID type should handle \x03 appropriately.

        b = HexData(subtype,hexstr)         create a BSON BinData value from a hex string
        b = UUID(hexstr)                    create a BSON BinData value of UUID subtype
        b = MD5(hexstr)                     create a BSON BinData value of MD5 subtype
        "hexstr"                            string, sequence of hex characters (no 0x prefix)
        */
        const context = {
          Code: mongodb.Code,
          ObjectId: mongodb.ObjectID,
          ObjectID: mongodb.ObjectID,
          BinData: function(subtype, base64str) {
            return new mongodb.Binary(Buffer.from(base64str, 'base64'), subtype);
          },
          UUID: function(hexstr) {
            return new mongodb.Binary(Buffer.from(hexstr, 'hex'), 4);
          },
          MD5: function(hexstr) {
            return new mongodb.Binary(Buffer.from(hexstr, 'hex'), 5);
          },
          HexData: function(subtype, hexstr) {
            return new mongodb.Binary(Buffer.from(hexstr, 'hex'), subtype);
          },
          DBRef: mongodb.DBRef,
          Timestamp: mongodb.Timestamp,
          NumberLong: mongodb.Long,
          NumberDecimal: mongodb.Decimal128,
          NumberInt: mongodb.Int32,
          MaxKey: mongodb.MaxKey,
          MinKey: mongodb.MinKey,
          ISODate: function(string) {
                if (string) {
                  return new Date(string);
                }
                return new Date();
          },
        };

        const object = vm.runInNewContext(`(${mongoString})`, context);
        return object;
    }
}


module.exports = mongoHelpers;

