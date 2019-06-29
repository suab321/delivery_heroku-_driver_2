//importing node modules
const GridfsStorage=require('multer-gridfs-storage');
const Grid=require('gridfs-stream');
const multer=require('multer');
const mongoose=require('mongoose');
const router=require('express').Router();

//importing from developer made folders
const {mongourl}=require('../urls/links');
const {decodeToken}=require('../jwt/jwt');
const {perma}=require('../database/db')
//ended//

//middleware function to check authorization token//
const get_token=(req,res,next)=>{
    const header=req.headers['authorization'];
    if(header === undefined)
        res.status(400).json({code:"2",msg:"Token required"});
    else{
        const token=header.split(' ')[1];
        req.token=token;
        next();
    }
}
//middleware function ended//

let connection=mongoose.createConnection(mongourl,{useNewUrlParser:true,useCreateIndex:true});
let gfs;

connection.once("open",()=>{
    gfs=Grid(connection.db,mongoose.mongo);
})
let storage=new GridfsStorage({
    url:mongourl,
    file:(req,file)=>{
        const fileInfo={filename:file.originalname}
    }
})

const upload=multer({storage}).single('file');

//route to upload phtoto//
router.post('/upload',get_token,(req,res)=>{
    const user_id=decodeToken(req.token).user;
    if(user_id){
    upload(req,res,err=>{
        console.log(req.file);
        if(err)
            res.status(400).json({code:"0",msg:"Error uploading phtot"});
        else{
            perma.findByIdAndUpdate({_id:user_id},{photo_id:req.file.filename}).then(user=>{
                res.status(200).json({code:"1",msg:"photo uploaded successfully"});
            }).catch(err=>{
                res.status(400).json({code:"4",msg:"Error updating photo id"});
            })
        }
        })
    }
    else
        res.status(400).json({code:"3",msg:"You are authenticated user"});
})
//route ended//

//route to get the image//
router.get('/get_image/:filename',get_token,(req,res)=>{
    const user_id=decodeToken(req.token).user;
    if(user_id){
       gfs.files.find({filename:req.params.filename}).toArray().then(file=>{
            const readstream=gfs.createReadStream(file[0].filename);
            readstream.pipe(res)
       }).catch(err=>{
           console.log(err);
           res.status(400).json({code:"0",msg:"File not found"});
       })
    }
    else
        res.status(400).json({code:"2",msg:"Error authenticating token"});
})
//route ended//



module.exports={
    upload_route:router
}
