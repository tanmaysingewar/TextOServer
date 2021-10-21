const mongodb = require('mongodb');
const uri = 'mongodb+srv://Tanmay:FicktreeTanmay@146@ficktree.bvlsf.mongodb.net/Ficktree?retryWrites=true&w=majority';
const localuri = "mongodb://localhost:27017"

export async function connectDb(){
    // connection to database
    const client = await mongodb.MongoClient.connect(uri,{ useUnifiedTopology: true });  //# connecting to DB
    //return connection
    return client.db("TextO")  //# returning the connection on "New" DB 
}

//token :   eyJhbGciOiJIUzI1NiJ9.NjE0NzIxMDU5ZGY5YzYwOTc1Y2Q3ZjEx.A7Sq4AsJfRYoNuOeH9oQ4drLOYZgrpDwsmnkD4styDo
//const uri = 'mongodb+srv://Tanmay:FicktreeTanmay@146@ficktree.bvlsf.mongodb.net/Ficktree?retryWrites=true&w=majority';
