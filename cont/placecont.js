const {validationResult} = require("express-validator");
const fs=require("fs");
const mongoose=require('mongoose');
const bodyparser=require('body-parser');
const Place=require('../model/place');
const HttpError = require('../model/http_error');
const User=require("../model/user")


const createplace=async(req,res,next)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return next(new HttpError('please input valid data',422));
    }
   
const{title, description,address,creator}=req.body;
    let coordinates;
   
    async function getcoordinates(){
        return{
            lat:40.3546546,
            lng:-4024354354
    }
        } ;

    try{
        coordinates=await getcoordinates(address);  
    }
    catch(error)
    {
        return next(error);
    }
    
    const createdplace=new Place({
        title,
        description,
        address,
        image:req.file.path,
        location: coordinates,
        creator
    });
    let user;
    try{
        user= await User.findById(creator);
       }
     catch(err)
     {
       const error=new HttpError('creater is not find  is failed plz try again',500);  
   return next(error);
   };
   if(!user){
    const error=new HttpError('could not find user for provided id',500);  
    return next(error);

   }

   
    try{
    
    const sess=await mongoose.startSession();
    sess.startTransaction();
    await createdplace.save({session:sess});
    user.places.push(createdplace);
    await user.save({session:sess});
    await sess.commitTransaction();
 }

  catch(err)
  {
    const error=new HttpError('creating place is failed plz try again',500);  
return next(error);
};

  res.status(201).json({places:createdplace});
};

const getplacebyid=async(req,res,next)=>{
    let place;
    const placeid=req.params.pid;
  
    try{
    place=await Place.findById(placeid);
    }
    catch(err)
    {
    const error=new HttpError('something is wrong',500);  
    return next(error);
    }

   
    if(!place){
    const error= new HttpError('could find a place for provided id',404);
    return next(error);  
}
    res.json({place:place.toObject({getters:true})});
};


const getplacebyuserid=async(req,res,next)=>{
    let place;
    const userid=req.params.uid;
    
    try{
    place=await Place.find({creator:userid});
    }
    catch (err){
        const error=new HttpError('fetching is failed',500);
        return next(error);  
     }
   
    if(!place||place.length===0){
    return next(new HttpError('could not find place for provided id',404));  
}

    res.json({place:place.map(place=>place.toObject({getters:true}))});


};

const getplaceupdate=async(req,res,next)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return next(new HttpError('please input valid data',422));
    }
const{title,description}=req.body;
const placeid=req.params.pid;
let place;
try{
    place=await Place.findById(placeid);

}
catch(err){
    const error= new HttpError('something went wrong could not place update',500);
    return next(error);

}
place.title=title;
place.description=description;
try{
   await place.save();
}
catch(err){
    const error= new HttpError('something went wrong could not update',500);
    return next(error);

}
res.status(200).json({place:place.toObject({getters:true})});

};

const getdeleteplace = async (req, res, next) => {
  const userid = req.params.pid;

  let place;
  try {
    place = await Place.findById(userid).populate('creator');
    
  } catch (err) {
    const error = new HttpError(
      'place id is not valid, could not delete place.',
      500
    );
    return next(error);
  }

  if (!place) {
    const error = new HttpError('Could not find place for this id.', 404);
    return next(error);
  }
  const imagePath=place.image;

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.deleteOne({session:sess});
    place.creator.places.pull(place);
    await place.creator.save({session: sess});
    await sess.commitTransaction();
    
  } 
  catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete place.',
      500
    );
    return next(error);
  }
  fs.unlink(imagePath,(err)=>{
    console.log(err);

  });
  
  res.status(200).json({ message: 'Deleted place.' });
};


exports.createplace=createplace;
exports.getplacebyid=getplacebyid;
exports.getplacebyuserid=getplacebyuserid
exports.getplaceupdate=getplaceupdate;
exports.getdeleteplace=getdeleteplace;