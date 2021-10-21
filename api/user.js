const { connectDb } = require("../connect")
const jwt = require('jsonwebtoken');
const { ObjectId } = require("mongodb");
const url_split = require("../url_split");
const tokenCheck = require("../tokenCheck");

module.exports = async (req,res) => {
    const db = await connectDb()
    if (req.method === "GET") {
        const user_db =  db.collection('User')
        const post_db =  db.collection('Post')
        const x = url_split(req.url)
        
        if (x[0]?.noString) {
            //# Getting all users
            const all_user = await user_db.find({}).toArray()
            return res.json({
                all_user
            })
        }

        if (x[0].Name === 'id' || 'username') {
            let find = false
            if (x[0].Name === 'username') {
                console.log(x[0].Value, "username")
                // # Getting user by username 
                find = await user_db.find({"username" : {$regex: x[0].Value,$options: 'i'}}).project({
                    "username" : 1, 
                    "name" : 1,
                    "profile_pic" : 1,
                }).toArray()   
              
            }else if (x[0].Name === 'id') {
                console.log(x[0].Value, "ID")
                //# Getting user by user ID
                var decoded = await jwt.verify(x[1]?.Value, 'shhhhh');
                console.log(decoded)
                const user_profile = await user_db.findOne({_id : ObjectId(x[0].Value)},{projection : {
                    "username" : 1, 
                    "name" : 1,
                    "profile_pic" : 1,
                    "bio" : 1,
                    "joiners" : { $size: "$joiners" },
                    "joinings" : { $size: "$joinings" },
                    "is_joined" : { $in: [ObjectId(decoded),'$joiners'] }, //? put the calling user ID here 
                }})
                console.log(user_profile)
                if (!user_profile) {
                    return res.json({
                        "status" : "No useer exist"
                    })
                }
                const post_count = await post_db.find({"user._id" : ObjectId(x[0].Value)},{projection : {
                    "_id" : 1
                }}).count()

                
                find =[{
                    ...user_profile,
                    ...{post_count : post_count}
                }]
            }

            if (!find[0]) {
                return  res.json({
                    status : "no_user",
                    empty : true
                })
            }

            if(find){
                return res.json({
                    find
                })
            }
            else{
                return res.json({
                    status : "no_user"
                })
            }
        }
    }
    if (req.method === "POST") {
        console.log("create user")
        const user_db =  db.collection('User')
        const post_db =  db.collection('Post')
        const body = req.body;
        const find = await user_db.findOne({email : body.email},{
            projection :{
                "_id" : 1,
                "username" : 1,
                "name" : 1,
                "email" : 1,
                "bio" : 1,
                "profile_pic" : 1,
                "joiners" : { $size: "$joiners" },
                "joinings" : { $size: "$joinings" },
            }
        })
        
        //# Finding if user is available then it is login user
        if(find){
            var token = jwt.sign(find._id.toString(), 'shhhhh');
            console.log(token)
            const post_count = await post_db.find({"user._id" : ObjectId(find._id)}).project({"_id" : 1}).count()
            return res.json({
                _id : find._id,
                email : find.email,
                username : find.username,
                name : find.name,
                profile_pic : find.profile_pic,
                bio : find.bio,
                token : token,
                joiners_count : find.joiners,
                joining_count : find.joinings,
                post_count : post_count
            })
        }else if (body.default_bio && body.username && body.name && body.email) { 
            const user = await user_db.insertOne({
                email : body.email,
                username : body.username,
                name : body.name,
                profile_pic : body.profile_pic,
                bio : body.default_bio,
                joiners : [],
                joinings : []
            })
            let send_data = user.ops[0]
            var token = jwt.sign(send_data._id.toString(), 'shhhhh');
            console.log(token)

            return res.json({
                _id : send_data._id,
                email : send_data.email,
                username : send_data.username,
                name : send_data.name,
                bio : send_data.bio,
                profile_pic : send_data.profile_pic,
                token : token,
                joiners_count : 0,
                joining_count : 0,
                post_count : 0
            })
        } else {
            return res.json({
                status : "new_user"
            })
        }
    }
    if (req.method === "PATCH") {   
        console.log("Update")  
        const x = url_split(req.url)          
        //# UPDATE User by UserID
        const user_db =  db.collection('User')
        const post_db =  db.collection('Post')
        const get_id = req.query.id
        const data = req.body
        console.log(get_id, data)
        const check = await tokenCheck(x[1].Value,x[0].Value)
        if (check) {
            return res.json({
                status : "unauthenticated"
            })
        }

        const user = await user_db.findOneAndUpdate({_id : ObjectId(x[0].Value)},{
            $set: { 
                username : data.username,
                name : data.name,
                profile_pic : data.profile_pic,
                bio : data.bio
            }
        },{returnDocument : "after", projection: {
                "username" : 1, 
                "name" : 1,
                "profile_pic" : 1,
                "bio" : 1,
                "joiners_count" : { $size: "$joiners" },
                "joining_count" : { $size: "$joinings" },
        }})
        
        if (!user) {
            return res.json({
                user : "no user"
            })
        }

        const post_count = await post_db.find({"user._id" : ObjectId(user.value._id)},{projection : {
            "_id" : 1
        }}).count()

        await post_db.updateMany({"comments.user._id" : ObjectId(user.value._id)},{
            $set :{
                 "comments.$[element].user" : {
                    name : user.value.name,
                    username : user.value.username,
                    _id : user.value._id,
                    pic_url : user.value.profile_pic
            }
            }
        },{arrayFilters: [ { "element.user._id": { $in: [user.value._id] } } ] })

        console.log("B")

        await post_db.updateMany({"user._id" : ObjectId(user.value._id)},{
            $set :{
                user : {
                    name : user.value.name,
                    username : user.value.username,
                    _id : user.value._id,
                    pic_url : user.value.profile_pic
                }
            }
        })

        console.log("A")

        var token = jwt.sign(user.value._id.toString(), 'shhhhh');

        let userData = {
            ...user.value,
            ...{token : token}

        }

        return res.json({
            ...userData,
            ...{post_count : post_count}
        })
    }
    if (req.method === "DELETE") {             
        //# DELETE User by UserID
        const x = url_split(req.url) 
        const check = await tokenCheck(x[1].Value,x[0].Value)
        if (check) {
            return res.json({
                status : "unauthenticated"
            })
        }
        const user_db =  db.collection('User')
        const delete_user = await user_db.findOneAndDelete({_id : ObjectId(x[0].Value)})
        return res.json({
            delete_user
        })
    }
}