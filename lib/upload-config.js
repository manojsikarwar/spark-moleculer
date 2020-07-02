const multer = require('multer')
const path = require('path')
var moment   = require('moment');
var myDate   = new Date();
var date     = moment(myDate).format('lll');

module.exports = {
    storage : new multer.diskStorage({
        destination : path.resolve('./public/upload/image'),
        filename : function(req, file, callback) {
            const file_name = file.originalname;
            const image = file_name.split('.')
            callback(null, Date.now()+'.'+ image[1])
        }
    })
}
