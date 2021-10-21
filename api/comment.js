const { connectDb } = require("../connect")
const { ObjectId } = require("mongodb");
const url_split = require("../url_split");
const tokenCheck = require("../tokenCheck");

module.exports = async (req,res) => {
    const db = await connectDb()
    const post_id = req.query.id
    const post_db =  db.collection('Post')

    if (req.method === "GET") {
        console.log("GET Comment")
        const post_comments = await post_db.findOne({"_id" : ObjectId(post_id)},{
            projection : {
                "comments" : 1
            }
        })

        return res.json({
            post_comments
        })
    }else if(req.method === "POST") {
        const data = req.body
        const x = url_split(req.url)
        const check = await tokenCheck(x[1].Value,data.user_id)
        if (check) {
            return res.json({
                status : "unauthenticated"
            })
        }else{
            const commented = await post_db.findOne({"_id" : ObjectId(x[0].Value)},{projection : {
                iscommented : { $cond: { if: {$in: [ObjectId(data.user_id),'$comments.user._id']}, then: true, else: false } }
            }})
    
            console.log(commented)
    
            if (commented.iscommented) {
                return res.json({
                    iscommented : commented.iscommented,
                    message : "You can only comment once!"
                })
            }
            const post_comments = await post_db.findOneAndUpdate({"_id" : ObjectId(x[0].Value)},{
                $push : { "comments" : {
                    user : {
                        pic_url : data.user_pic,
                        name : data.user_name,
                        username : data.user_username,
                        _id : new ObjectId(data.user_id)
                    },
                    comments : data.comment
                }} 
            },{
                returnDocument : "after",
                projection : {
                    "comments" : { $size: "$comments" }
                }
            })
    
            return res.json({
                post_comments : post_comments?.value?.comments
            })
        }
    }else if (req.method === "DELETE") {
        var x = url_split(req.url)
        const check = await tokenCheck(x[2].Value,x[1].Value)
        if (check) {
            return res.json({
                status : "unauthenticated"
            })
        }else{
            const post_comments = await post_db.findOneAndUpdate({"_id" : ObjectId(x[0].Value)},{
                $pull : { "comments" : {"user._id" : ObjectId(x[1].Value)}} 
            },{
                returnDocument : "after",
                projection : {
                    "comments" : { $size: "$comments" }
                }
            })

            return res.json({
                post_comments : post_comments.value.comments
            })
        }
        
    }
}