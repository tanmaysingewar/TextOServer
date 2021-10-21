const mongodb = require('mongodb');
const uri = 'mongodb://umaorj8arzmg4oltks9l:bGiA1SdJdCIPB9CRLiIN@bxilqqpqgp5xgvx-mongodb.services.clever-cloud.com:27017/bxilqqpqgp5xgvx';
const localuri = "mongodb://localhost:27017"

export async function connectDb(){
    // connection to database
    const client = await mongodb.MongoClient.connect(uri,{ useUnifiedTopology: true });  //# connecting to DB
    //return connection
    return client.db("New")  //# returning the connection on "New" DB 
}

//token :   eyJhbGciOiJIUzI1NiJ9.NjE0NzIxMDU5ZGY5YzYwOTc1Y2Q3ZjEx.A7Sq4AsJfRYoNuOeH9oQ4drLOYZgrpDwsmnkD4styDo