const { connectDb } = require("../connect")

module.exports = async (req,res) => {
    const db = await connectDb()                      // ?connecting to DB 
    const user_collection = db.collection('User')          // ?selecting collection post
    if (req.method === 'GET') { // usernames by searching
        const search = req.query.username.toString()
        console.log(search)
        const user = await user_collection.findOne({"username" : search})
        console.log(user)
        if (user) {
            return res.json({
                available : false
            })
        }else{
            return res.json({
                available : true
            })
        }
    }
}