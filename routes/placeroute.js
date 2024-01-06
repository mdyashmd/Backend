const express=require("express");
const { check } = require('express-validator');
const app=express();
const router=express.Router();
const placecontroller=require("../cont/placecont")
const fileUpload =require('../middleware/file-upload.js');
router.post('/',
fileUpload.single('image'),
[
    check('title')
      .not()
      .isEmpty(),
    check('description').isLength({ min: 5 }),
    check('address')
      .not()
      .isEmpty()
  ]
,placecontroller.createplace);
router.get('/:pid',placecontroller.getplacebyid);
router.get('/user/:uid',placecontroller.getplacebyuserid);
router.patch('/:pid',
[
    check('title')
      .not()
      .isEmpty(),
    check('description').isLength({ min: 5 })
  ],placecontroller.getplaceupdate);
router.delete('/:pid',placecontroller.getdeleteplace)

module.exports=router;
