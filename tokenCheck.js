var jwt = require('jsonwebtoken');

module.exports = async (token , u_id) => {
    console.log(token)
    var decoded = await jwt.verify(token, 'shhhhh');
    console.log(u_id.toString() === decoded.toString(), "Data from token")
    console.log(u_id.toString(),decoded.toString())
    if (u_id.toString() === decoded.toString()) {
        console.log(false)
        console.log(u_id.toString())
        console.log(decoded.toString())
        return false
    }else{
        console.log(u_id.toString())
        console.log(decoded.toString())
        console.log(true)
        return true
    }
}