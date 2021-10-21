const { connectDb } = require("../connect")
const { ObjectId } = require("mongodb");
var jwt = require('jsonwebtoken');
const url_split = require("../url_split");

module.exports = async (req,res) => {
    const db = await connectDb()
    const post_db =  db.collection('Post')
    const user_db =  db.collection('User')
    const x = url_split(req.url)

    var decoded = await jwt.verify(x[0].Value, 'shhhhh');

    if (x[1]?.Name === "explore") {
        const home_posts = await post_db.find({},{projection : {
            "title" : 1,
            "post" : 1,
            "comments" : { $size: "$comments" },
            "likes" : { $size: "$likes" },
            "user" : 1,
            "isliked" : { $cond: { if: {$in: [ObjectId(decoded),'$likes']}, then: true, else: false } }
        }}).sort("likes",1).limit(10).toArray()

        return res.json({
            home_posts
        })
    }

    console.log(decoded,"Home")

    const user_joinings = await user_db.findOne({"_id" : ObjectId(decoded)},{projection : {
        joinings : 1,
        joinings_length : { $size: "$joinings" },
    }})

    const home_posts = await post_db.find({"user._id" : {$in : user_joinings.joinings}},{projection : {
        "title" : 1,
        "post" : 1,
        "comments" : { $size: "$comments" },
        "likes" : { $size: "$likes" },
        "user" : 1,
        "isliked" : { $cond: { if: {$in: [ObjectId(decoded),'$likes']}, then: true, else: false } }
    }}).limit(10).sort("_id",-1).toArray()

    if (home_posts[0]) {
        return res.json({
            home_posts
        }) 
    }

    return res.json({
        "home_posts": [
            {
                "noPost" : true
            }
        ]
    })
}