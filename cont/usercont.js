const {validationResult} = require("express-validator");
const mongoose=require('mongoose');
const bodyparser=require('body-parser');
const HttpError=require("../model/http_error");
const User=require('../model/user')

const getuser=async(req,res,next)=>{
   let users;
    try{
     users= await User.find({},'-password');
    }
    catch(err){
        const error = new HttpError('not geting user information',500);

    }
    res.json({users:users.map(users=>users.toObject({getters:true}))});
};

const signup = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(
        new HttpError('Invalid inputs passed, please check your data.', 422)
      );
    }
    const { name, email, password } = req.body;
  
    let existingUser;
    try {
      existingUser = await User.findOne({ email: email });
    } catch (err) {
      const error = new HttpError(
        'Signing up failed, please try again later.',
        500
      );
      return next(error);
    }
  
    if (existingUser) {
      const error = new HttpError(
        'User exists already, please login instead.',
        422
      );
      return next(error);
    }
  
    const createdUser = new User({
      name,
      email,
      image:req.file.path,
      password,
      places: []
    });
  
    try {
      await createdUser.save();
    } catch (err) {
      const error = new HttpError(
        'Signing up failed, please try again later.',
        500
      );
      return next(error);
    }
  
    res.status(201).json({ user: createdUser.toObject({ getters: true }) });
  };
  

  const login = async (req, res, next) => {
    const { email, password } = req.body;
  
    let existingUser;
  
    try {
      existingUser = await User.findOne({ email: email });
    } catch (err) {
      const error = new HttpError(
        'Loggin in failed, please try again later.',
        500
      );
      return next(error);
    }
  
    if (!existingUser || existingUser.password !== password) {
      const error = new HttpError(
        'Invalid credentials, could not log you in.',
        401
      );
      return next(error);
    }
  
    res.json({
      message: 'Logged in!',
      user: existingUser.toObject({ getters: true })
    });
  };
  
exports.getuser=getuser;
exports.signup=signup;
exports.login=login;
