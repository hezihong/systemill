// 引入模块
const express = require('express');
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const ejs = require('ejs');  
const app = express();

// 项目配置
// 模板引擎
app.engine('html',ejs.__express);
app.set('view engine','html');

// 配置静态资源
app.use(express.static("./public"));

// bodyParser配置
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// 项目路由
// 第一模块 Main前台
app.use("/",require("./routers/Main"));

// 第二模块 Admin后台
app.use("/admin",require("./routers/Admin"));

// 第三模块 Api接口
app.use("/api",require("./routers/Api"));

// 数据连接与服务器开启
mongoose.connect("mongodb://127.0.0.1:27017/admin1970",{useUnifiedTopology:true,useNewUrlParser:true},(err)=>{
    if(err){
        throw Error("数据库连接失败");
        return;
    }else{
        app.listen(3000,()=>{
            console.log('请访问:http://127.0.0.1:3000');
        })
    }
})