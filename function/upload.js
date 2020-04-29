const formidable = require("formidable");
const sd = require("silly-datetime");
const path = require("path");
const fs = require("fs");

// 上传图片功能封装
exports.Upload = function(req,callback){

    const form = formidable({ multiples: true });

    // form.uploadDir = "./uploads"; //设置图片上传地址
    form.uploadDir = "../project3/src/assets/img"; //设置图片上传地址
    form.parse(req, (err, fields, files) => {
        
        if(err){
            callback(err,null);
        }

        // 判断如果没有提交图片，不需要下面图片操作
        if(!("photo" in files) || files.photo.size == 0){
            callback(null,fields);
            return;
        }

        // 图片名称设置
        let tt = sd.format(new Date(),'YYYYMMDDHHmmss');
        let rr = parseInt(Math.random() * 89999 + 10000);
        let ext = path.extname(files.photo.name);


        // 旧路径
        let oldpath = __dirname + "/../" + files.photo.path;
        // 新路径
        let newpath = __dirname + "/../../project3/public/img/"+ tt+rr+ext;
        // console.log(oldpath,newpath);
        fs.rename(oldpath,newpath,function(err){


            if(err){ callback(err,null);}
            fields.photo = "/" +tt +rr +ext;

            callback(null,fields)
        })

        
    });

}