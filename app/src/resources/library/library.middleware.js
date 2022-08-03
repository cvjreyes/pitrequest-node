const util = require("util");
const multer = require("multer");
const maxSize = 2 * 1024 * 1024 * 100;
const fs = require('fs');
const { SSL_OP_NO_QUERY_MTU } = require("constants");

let uploadImageStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    await cb(null, './app/storage/library/images')
  },
  filename: (req, file, cb) => {
    //console.log(file.originalname);
    cb(null, file.originalname);
  },
});

let uploadRFAStorage = multer.diskStorage({
    destination: async (req, file, cb) => {

        await cb(null, './app/storage/library/rfa')
    
      },
      filename: (req, file, cb) => {
        //console.log(file.originalname);
        cb(null, file.originalname);
      },
});

let uploadImage = multer({
  storage: uploadImageStorage,
  limits: { fileSize: maxSize },
}).single("file");

let uploadRFA = multer({
  storage: uploadRFAStorage,
  limits: { fileSize: maxSize },
}).single("file");


let uploadImageMiddleware = util.promisify(uploadImage);
let uploadRFAMiddleware = util.promisify(uploadRFA);

module.exports = {
  uploadImageMiddleware,
  uploadRFAMiddleware
}