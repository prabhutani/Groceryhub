const MongoClient = require("mongodb").MongoClient
const uri ="mongodb://localhost:27017/productratings"
var db

const connectDb = (callback) => {
    if (db) return callback()
    MongoClient.connect( uri, 
        (err, database) => {
            if (err) return console.log(err)
            db = database.db("dbName") 
            console.log("Mongo Database Connected")
            callback()
        }
    )
}

const getDb = (collectionToGet) => {
    return db.collection(collectionToGet)
}

module.exports = {
    connectDb,
    getDb,
}