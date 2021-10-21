const mongodb = require('mongodb');
const uri = 'mongodb://utlizut5tmwgjjffbkp2:6te9nrXxIctmQH42D9cz@bs1m6qxtojiqs2h-mongodb.services.clever-cloud.com:27017/bs1m6qxtojiqs2h';
const localuri = "mongodb://localhost:27017"

export async function connectDb(){
    // connection to database
    const client = await mongodb.MongoClient.connect(localuri,{ useUnifiedTopology: true });  //# connecting to DB
    //return connection
    return client.db("New")  //# returning the connection on "New" DB 
}

//token :   eyJhbGciOiJIUzI1NiJ9.NjE0NzIxMDU5ZGY5YzYwOTc1Y2Q3ZjEx.A7Sq4AsJfRYoNuOeH9oQ4drLOYZgrpDwsmnkD4styDo