const util = require("util");
const multer = require("multer");
const maxSize = 2 * 1024 * 1024 * 100;
const fs = require('fs');
const { SSL_OP_NO_QUERY_MTU } = require("constants");

let storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const path_pdf = './app/storage/csptracker/drawings/' + file.originalname.split('.').slice(0, -1) + ".pdf";
    const path_png = './app/storage/csptracker/drawings/' + file.originalname.split('.').slice(0, -1) + ".png";


    if (!fs.existsSync(path_pdf) && !fs.existsSync(path_png)) {
        console.log("Se añade")
        await cb(null, './app/storage/csptracker/drawings')
    }else{
        
        cb("error", null)
        console.log("Ya existe")
    }

  },
  filename: (req, file, cb) => {
    //console.log(file.originalname);
    cb(null, file.originalname);
  },
});

let updateStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const path_pdf = './app/storage/csptracker/drawings/' + file.originalname.split('.').slice(0, -1) + ".pdf";
    const path_png = './app/storage/csptracker/drawings/' + file.originalname.split('.').slice(0, -1) + ".png";


    if (fs.existsSync(path_pdf) || fs.existsSync(path_png)) {
        
        console.log("Se añade")
        await cb(null, './app/storage/csptracker/drawings')
    }else{
        
        cb("error", null)
        console.log("No existe")
    }

  },
  filename: (req, file, cb) => {
    //console.log(file.originalname);
    cb(null, file.originalname);
  },
});




let uploadFile = multer({
  storage: storage,
  limits: { fileSize: maxSize },
}).single("file");

let updateFile = multer({
  storage: updateStorage,
  limits: { fileSize: maxSize },
}).single("file");


let uploadFileMiddleware = util.promisify(uploadFile);
let updateFileMiddleware = util.promisify(updateFile);

module.exports = {
  uploadFileMiddleware,
  updateFileMiddleware
}