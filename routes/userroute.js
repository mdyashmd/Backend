const express =require("express");
const { check } = require('express-validator');
const fileUpload = require('../middleware/file-upload');


const UserController=require("../cont/usercont")


const router=express.Router();

router.get("/",UserController.getuser);
router.post(
    '/signup',
    fileUpload.single('image'),
    [
      check('name')
        .not()
        .isEmpty(),
      check('email')
        .normalizeEmail()
        .isEmail(),
      check('password').isLength({ min: 6 })
    ],
    UserController.signup
  );

router.post("/login", UserController.login);



module.exports=router;