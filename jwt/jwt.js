const jwt=require('jsonwebtoken');
const {perma}=require('../database/db');


module.exports={
    generateToken,
    decodeToken
}



function generateToken(data){
    try{
  const token=jwt.sign({user:data},"suab");
    return token;
    }catch{
        return 0;
    }
}

function decodeToken(token){
    try{
        const authdata=jwt.verify(token,"suab");
        perma.findById({_id:authdata.user}).then(user=>{
            return authdata;
        }).catch(err=>{return authdata;})
        return authdata;
    } catch(err){
        return 0;
    }
}




