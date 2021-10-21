const { ObjectId } = require("mongodb")
const { connectDb } = require("../connect")
const url_split = require("../url_split");
const tokenCheck = require("../tokenCheck");
var jwt = require('jsonwebtoken');

module.exports =async (req,res) => {
    const db = await connectDb()                      // ?connecting to DB 
    const post_db = db.collection('Post')          // ?selecting collection post

    if (req.method === "GET") {
        let userId = url_split(req.url);

        console.log(userId)
        if (userId[1]?.Value) {
            var decoded = await jwt.verify(userId[1]?.Value, 'shhhhh');
            
        }else{
            var decoded = "6141da10cede881d8780f061"
        }
        
        if (userId[0].Value) {
            const get_all = await post_db.find({
                'user._id' : ObjectId(userId[0].Value)
            },{projection : {
                "title" : 1,
                "post" : 1,
                "comments" : { $size: "$comments" },
                "likes" : { $size: "$likes" },
                "user" : 1,
                "isliked" : { $cond: { if: {$in: [ObjectId(decoded),'$likes']}, then: true, else: false } }
            }}).sort("_id",-1).toArray()

            if (!get_all[0]) {
                return res.json({
                    "_id" : "1234567890",
                    "noPost" : true
                })
            }

            return res.json(get_all)
        }

        const getPost = await post_db.find().toArray()   //# GET All Post 
        console.log("Getting All post" .green)

        return res.json({        // ** responce to user
          data : getPost
        })
    }
    if (req.method === "POST") {
        const body = req.body

        const x = url_split(req.url)
        
        let like_post = x[0].Name || false
        
        if (like_post === "like") {
            console.log("like")
            const post_id = body.p_id
            const user_id = body.u_id

            const check = await tokenCheck(x[1].Value,user_id)
            if (check) {
                return res.json({
                    status : "unauthenticated"
                })
            }
            const check_like = await post_db.findOne({"_id" : ObjectId(post_id)},{projection : {
                isliked : { $cond: { if: {$in: [ObjectId(user_id),'$likes']}, then: true, else: false } }
            }})

            console.log(check_like)

            let like = 0

            let islike = false

            if (check_like.isliked) {
                like = await post_db.findOneAndUpdate({"_id" : ObjectId(post_id)},{
                    $pull: { "likes" : ObjectId(user_id)} 
               },{returnDocument : "after" , projection : {
                   "likes" : { $size: "$likes" }
               }})
               islike = false
               console.log(like,"unlike")
            }else{
                like = await post_db.findOneAndUpdate({"_id" : ObjectId(post_id)},{
                    $push : { "likes" : new ObjectId(user_id)} 
               },{returnDocument : "after" , projection : {
                   "likes" : { $size: "$likes" }
               }})
               console.log(like,"like")
               islike = true
            }

            return res.json({
                like : like.value.likes,
                isliked : islike
            })
        }else{
            const check = await tokenCheck(x[0].Value,body.user_id)
            if (check) {
                return res.json({
                    status : "unauthenticated"
                })
            }else{
                if (!body.title || !body.post || !body.user_pic || !body.user_name || !body.user_username || !body.user_id) {
                    return res.json({
                        Error : "something went wrong!!"
                    })
                }else{
                    const docs = await post_db.insertOne({       // ?Inserting document to DB
                        title : body.title,
                        post : body.post,
                        comments : [],
                        likes : [],
                        user : {
                            pic_url : body.user_pic,
                            name : body.user_name,
                            username : body.user_username,
                            _id : new ObjectId(body.user_id)
                        }
                      }) // Db commands
            
                      return res.json({       // ** responce to user
                        reasult : docs.ops[0]
                    });
                }
            }
        }
    }
    if (req.method === "DELETE") {
        const x = url_split(req.url)
        console.log("DELETE called",)
        const check = await tokenCheck(x[2].Value,x[1].Value)
        if (check) {
            return res.json({
                status : "unauthenticated"
            })
        }
        const getPost = await post_db.findOneAndDelete({"_id" : ObjectId(x[0].Value)})
        return res.json({
            delete : true
        })
    }
}