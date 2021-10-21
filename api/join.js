const { ObjectId } = require("mongodb")
const { connectDb } = require("../connect")
const tokenCheck = require("../tokenCheck")
const url_split = require("../url_split")

module.exports = async (req,res) => {
    const db = await connectDb()                      // ?connecting to DB 
    const user_db = db.collection('User')             // ?selecting collection post

    if (req.method === "POST") {
        const data = req.body
        console.log(data)
        const x = url_split(req.url)
        const check = await tokenCheck(x[0].Value,data.user_id)
        if (check) {
            return res.json({
                status : "unauthenticated"
            })
        }else{
            const check_join = await user_db.findOne({"_id" : ObjectId(data.client_id)},{projection : {
                isjoin : { $cond: { if: {$in: [ObjectId(data.user_id),'$joiners']}, then: true, else: false } }
            }})
            let join = 0
            let state = "";
                if (check_join.isjoin) {
                    state = false;
                    join = await user_db.findOneAndUpdate({"_id" : ObjectId(data.client_id)},{ // client
                        $pull: { "joiners" : ObjectId(data.user_id)}  // user
                   },{returnDocument : "after" , projection : {
                       "joiners" : { $size: "$joiners" }
                   }})
    
                   //client joinings pull
    
                   await user_db.findOneAndUpdate({"_id" : ObjectId(data.user_id)},{ // user
                        $pull: { "joinings" : ObjectId(data.client_id)} // client
                    },{returnDocument : "after" , projection : {
                        "joinings" : { $size: "$joinings" }
                    }})
    
                   console.log(join,"unjoiners")
                }else{
                    state = true;
                    join = await user_db.findOneAndUpdate({"_id" : ObjectId(data.client_id)},{ // client
                        $push : { "joiners" : new ObjectId(data.user_id)} // user
                   },{returnDocument : "after" , projection : {
                       "joiners" : { $size: "$joiners" }
                   }})
    
                   // clients joinings push
    
                   await user_db.findOneAndUpdate({"_id" : ObjectId(data.user_id)},{ // user
                        $push : { "joinings" : new ObjectId(data.client_id)} // client
                    },{returnDocument : "after" , projection : {
                        "joinings" : { $size: "$joinings" }
                    }})
                   
                   console.log(join,"joiners")
                }
    
                return res.json({
                    join : join.value.joiners,
                    state : state
                })
        }
        
    }
}