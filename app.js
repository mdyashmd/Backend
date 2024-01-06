require('dotenv').config();
const express =require("express");
const fs =require("fs");
const bodyparser=require('body-parser');
const HttpError=require("./model/http_error");
const mongoose=require("mongoose");
const path=require('path');
const app =express();

const placeroute=require('./routes/placeroute');
const userroute=require('./routes/userroute');

app.use(bodyparser.json());

app.use('/uploads/images',express.static(path.join('uploads','images')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  
    next();
  });
  
app.use('/api/place',placeroute);
app.use('/api/user',userroute);

app.use((req,res,next)=>{
    const error = new HttpError("could not find this route",404);
    throw error;

});

app.use((error,req,res,next)=>{
  if(req.file){
    fs.unlink(req.file.path,(err)=>{
      console.log(err);

    });

  }
    if(res.headerSent){
        return next(error);
    }
    res.status(error.code|| 500);
    res.json({message:error.message||"unknown error !"});
    

});
mongoose.connect(`mongodb+srv://yasir:HuNPpTl3fuyFDFXg@cluster1.k1tdgyc.mongodb.net/product-test?retryWrites=true&w=majority`).then(()=>{
  console.log("connected to the database");  
  app.listen(process.env.PORT);
}).catch(err=>{
console.log("connection failed");
});



