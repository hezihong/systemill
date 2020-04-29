/*
    登录验证（前端+后端+数据库）
*/
const express = require('express');
const bodyParser = require('body-parser');
const formidable = require("formidable");
const db = require('./db.js');
const app = express();
const Upload = require("./function/upload");
var sd = require("silly-datetime");
const path = require("path");
const fs = require("fs");
const md5 = require("md5");
const session = require("express-session");

// session 配置
app.use(session({
    secret:"iloveyou", //验证 data+key
    resave:false,
    saveUninitialized:true
}))

//修改个人信息头像
app.post("/editmyphoto",(req,res)=>{
    // console.log(req);
    Upload.Upload(req,(err,fields)=>{
        if(err){
            res.send("操作失败");
            return;
        }else{
            let newphoto = fields.photo;
            
            let sql = "";
            // console.log(fields.purview)
            if(fields.purview == "manger"){
                sql = 'UPDATE mangerinfo SET photo = "'+fields.photo+'" WHERE id="'+fields.id+'";'
            }else{
                sql = 'UPDATE userinfo SET photo = "'+fields.photo+'" WHERE id="'+fields.id+'";'
            }

            let data = [];

            db.base(sql,data,(result)=>{
                // console.log(result);
                // res.send(result);
                res.redirect("http://localhost:8080/mycenter");
            });

            // res.send("替换")
        }
        // 添加数据
        // console.log(fields)
        // res.send(fields)
        
    })

})

// const system = require('./function/system')
var multer = require('multer')

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, '../project3/public/img/')
    },
    filename: function (req, file, cb) {
      var singfileArray = file.originalname.split('.');
      var fileExtension = singfileArray[singfileArray.length - 1];
      cb(null, singfileArray[0] + '-' + Date.now() + "." + fileExtension);
      console.log(file);
    }
  })

const upload = multer({
    storage: storage
  })



app.use(bodyParser.urlencoded({ extended: false }));
//处理post字段请求
app.use(bodyParser.json());


// 创建静态目录./dist,默认访问index.html文件
app.use(express.static("./dist"));

// app.use(express.static('public'));

app.use(express.static("./uploads"))

//允许跨域
// app.all('*', (req, res, next) => {
// 	res.header("Access-Control-Allow-Origin", "*");
// 	res.header("Access-Control-Allow-Headers", "X-Requested-With");
// 	res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
// 	res.header("X-Powered-By", ' 3.2.1')
// 	res.header("Content-Type", "application/json;charset=utf-8");
// 	next();
// });

//设置跨域请求
app.all('*', function (req, res, next) {
    //设置请求头
    //允许所有来源访问
    res.header('Access-Control-Allow-Origin', '*')
    //用于判断request来自ajax还是传统请求
    res.header("Access-Control-Allow-Headers", " Origin, X-Requested-With, Content-Type, Accept");
    //允许访问的方式
    res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS')
    //修改程序信息与版本
    res.header('X-Powered-By', ' 3.2.1')
    //内容类型：如果是post请求必须指定这个属性
    res.header('Content-Type', 'application/json;charset=utf-8')
    next()
  })


app.post("/test1",function(req,res){
    console.log(req.body);

    res.send(req.body);
})



//登录测试
app.get("/login",function(req,res,next){
    let param = req.query; 
    // console.log(req.query);
    let passwordmima = md5(md5(param.password).substr(11,7)+md5(param.password));
    // res.send(req.query)
        // res.send("201");
        var isLogin = false
        let sql =""
        let sql2 =""
        // if(param.job == ""){
        //     // return res.send("职业为空")
        // }
        if(param.job == "manger"){
            sql = 'select count(*) as total from mangerinfo where username="'+param.username+'" and password="'+passwordmima+'"';
            sql2 = "select id from mangerinfo WHERE username = '"+param.username+"';"
        }else if(param.job == "user"){
            sql = 'select count(*) as total from userinfo where username="'+param.username+'" and password="'+passwordmima+'"';           
            sql2 = "select id from userinfo WHERE username = '"+param.username+"';"
        }
        let data = [param.username,param.password];
        // let id = '';
        db.base(sql,data,(result)=>{
            // console.log(result[0].total);
            if(result[0].total == 1){
                isLogin = true;
                
                db.base(sql2,data,(result)=>{ 
                    // id = result[0].id
                    // console.log(result[0].id)
                    let userid = result[0].id;
                    req.session.login = 1; //1代表登陆成功
                    res.send({
                        isLogin:isLogin,
                        id:userid
                    })
                });
            }else{
                isLogin = false;
                
                res.send({
                    isLogin:isLogin
                })
            }
        });
        

})






//获取代办事项
app.get("/waitwork",function(req,res,next){
        let param = req.query;        
        let data = [param.id]
        let sql ="select title,status from waitwork where id = '"+param.id+"';"   
                            
        db.base(sql,data,(result)=>{
            // console.log(result,"res");
                res.send({
                    waitwork:result,
                })
            
        });

})

//添加待办事项
app.get("/addwait",function(req,res,next){
    let param = req.query;    
    let data = [param.id,param.value]
    // let list = ;
    
    let sql = 'INSERT INTO waitwork (id,title,status) VALUES ("'+param.id+'","'+param.value+'",0);'
    db.base(sql,data,(result)=>{
        // console.log(result,"res");
            res.send({
                result
            })
        
    });

})

//修改代办事件
app.get("/editwait",function(req,res,next){
    let param = req.query;    
    let data = [param.id,param.value,param.oldvalue]
    // let list = ;
    let sql = 'UPDATE waitwork SET title="'+param.value+'" WHERE id="'+param.id+'" AND title="'+param.oldvalue+'";'
    db.base(sql,data,(result)=>{
        // console.log(result,"res");
            res.send({
                result
            })
        
    });

})

//删除代办事件
app.get("/delwait",function(req,res,next){
    let param = req.query;    
    let data = [param.id,param.delvalue]
    // let list = ;
    let sql = 'DELETE from waitwork WHERE id="'+param.id+'" AND title="'+param.delvalue+'";'
    db.base(sql,data,(result)=>{
        // console.log(result,"res");
            res.send({
                result
            })
        
    });

})

//获取已有的用户名
app.get("/getusername",function(req,res,next){
    let param = req.query;    
    let data = []
    let list = null;
    // let list = ;
    let sql = 'select username from userinfo;'
    let sql2 = 'select username from wait;'
    db.base(sql,data,(result)=>{
            // console.log(result,"res");
            list = result;
            db.base(sql2,data,(result2)=>{
                // console.log(result2);
                for(let i =0;i < result2.length;i++){
                    list.push(result2[i]);                   
                }
                res.send(list);                     
        });      
    });

})

//用户添加申请，加入等候区
app.get('/waiteradd',(req,res,next)=>{
    let param = req.query;
    // console.log(param)
    let uid = 1000;
    let passwordmima = md5(md5(param.password).substr(11,7)+md5(param.password));
    let sql ="INSERT INTO wait (username,password,realname,idcard,sex,tel,qq,purview) VALUES ( '"+param.username+"','"+passwordmima+"','"+param.realname+"','"+param.idcard+"','"+param.sex+"','"+param.tel+"','"+param.mail+"',1 );"
    // res.send(param);
    let data = [param.username,param.password];

    db.base(sql,data,(result)=>{
        res.send(result);
    });
})

//管理员审批界面查询条目，返回所有信息
app.get('/getwaitinfo',(req,res,next)=>{
    let param = req.query;
    
    // var isLogin = false
    let sql ="select * from  wait"
    
    let data = [];
    db.base(sql,data,(result)=>{
        // console.log(result);
        res.send(result);
    });

})

//管理员审批节目删除1条数据
app.get('/delonewait',(req,res)=>{
    let param = req.query;
    

    let sql ="delete  from  wait where username = '"+param.username+"';"   
    let data = [];
    db.base(sql,data,(result)=>{
        // console.log(result);
        res.send(result);
    });

})

//管理员审批界面数据插入用户区
app.get('/useradd',(req,res)=>{
    let param = req.query;
       
    // let id_num =0;
    let sql1 ="select MAX(id) as maxid from userinfo ;"
    
    let data = [param.username,param.password];
    function checkmax(){
        return new Promise(function(resolve,reject){
            db.base(sql1,data,(result)=>{
                // console.log(result[0].maxid);
               let id_num = result[0].maxid
                resolve(++id_num);
            });

        })
    }
    async function text(){
        // getdata函数调用看能否在执行顺序中是同步结果
        let id_num = await checkmax(); //
        console.log(id_num)
        let sql2 = "INSERT INTO userinfo (id,username,password,realname,sex,idcard,tel,qq,purview,photo) VALUES ( '"+id_num+"','"+param.username+"','"+param.password+"','"+param.realname+"','"+param.sex+"','"+param.idcard+"','"+param.tel+"','"+param.qq+"','"+param.purview+"','/public.jpg');"
        db.base(sql2,data,(result)=>{
            // console.log(result[0].maxid);           
            res.send(param)
        });

    }
    text();

    
});


//查询用户的数据
app.get('/getuserinfo',(req,res,next)=>{
    let param = req.query;
    
    // var isLogin = false
    let sql ="select * from  userinfo"
    
    let data = [];
    db.base(sql,data,(result)=>{
        // console.log(result);
        res.send(result);
    });
})

//管理员管理删除1条数据
app.get('/deluser',(req,res)=>{
    let param = req.query;
    
    let sql ="delete  from  userinfo where id = '"+param.id+"';"   
    let data = [];
    db.base(sql,data,(result)=>{
        // console.log(result);
        res.send(result);
    });

})

//患者添加
app.post('/sickeradd',(req,res)=>{
    let param = req.body;
    // console.log(new Date());//2020-03-31T08:37:25.737Z
    var tt = sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss');
    
    // let id_num =0;
    let sql1 ="select MAX(Sid) as maxid from sickerinfo ;"
    
    let data = [param.username,param.password];
    function checkmax(){
        return new Promise(function(resolve,reject){
            db.base(sql1,data,(result)=>{
                // console.log(result[0].maxid);
               let id_num = result[0].maxid
                resolve(++id_num);
            });

        })
    }
    async function text(){
        // getdata函数调用看能否在执行顺序中是同步结果
        let id_num = await checkmax(); //
        console.log(id_num)
        let sql2 = "INSERT INTO sickerinfo (Sid,Sname,idcard,age,minzu,updatetime,Sresult,allergy,imsick,sex,Stel,jiguan,address,marryed,other,author) VALUES ( '"+id_num+"','"+param.Sname+"','"+param.idcard+"','"+param.age+"','"+param.minzu+"','"+tt+"','"+param.Sresult+"','"+param.allergy+"','"+param.imsick+"','"+param.sex+"','"+param.tel+"','"+param.jiguan+"','"+param.address+"','"+param.marryed+"','"+param.other+"','"+param.author+"' );"
        db.base(sql2,data,(result)=>{
            // console.log(result[0].maxid);
            
            res.send(param)
        });
    }
    text();

    
    
});

//患者删除1条数据
app.get('/delsicker',(req,res)=>{
    let param = req.query;
    // console.log(param)
    let sql ="delete  from  sickerinfo where Sid = '"+param.id+"';"   
    let data = [];
    db.base(sql,data,(result)=>{
        // console.log(result);
        res.send(result);
    });

})

//查询患者的基本信息
app.post('/getsickerinfo',(req,res)=>{
    let param = req.body;
    // console.log(param.my_id);
    let sql ="select * from sickerinfo WHERE author = '"+param.my_id+"'"
    
    let data = [];

    db.base(sql,data,(result)=>{
        // console.log(result);
        res.send(result);
    });


})

//修改患者信息
app.post("/editsicker",function(req,res,next){
    let param = req.body;    
    let data = [param.id,param.value,param.oldvalue]
    // let list = ;
    console.log(param)
    let sql = 'UPDATE sickerinfo SET Sname="'+param.Sname+'",age="'+param.age+'",sex="'+param.sex+'",idcard="'+param.idcard+'",marryed="'+param.marryed+'",minzu="'+param.minzu+'",jiguan="'+param.jigaun+'",address="'+param.address+'",Stel="'+param.Stel+'",allergy="'+param.allergy+'",imsick="'+param.imsick+'" WHERE Sid="'+param.Sid+'";'
    db.base(sql,data,(result)=>{
        // console.log(result,"res");
            res.send({
                result
            })
        
    });
    // res.send("222")
})

//查询病理信息
app.post('/getsickness',(req,res)=>{
    let param = req.body;
    // console.log(param.my_id);
    let sql ="select * from sickness "
    
    let data = [];

    db.base(sql,data,(result)=>{
        // console.log(result);
        res.send(result);
    });
})




//添加病理信息
app.post("/addsickness",(req,res)=>{
    // console.log(req);
    Upload.Upload(req,(err,fields)=>{
        if(err){
            res.send("操作失败");
            return;
        }else{
            let tt = sd.format(new Date(),'YYYYMMDDHHmmss');
            let updatatime = sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss');
            let rr = parseInt(Math.random() * 89999 + 10000);
            let tid = tt+rr;
            // let sql ="select count(*) as total from sickness where Sid='"+fields.Sid+"';"
            // let data = [];

            // db.base(sql,data,(result)=>{
            //     // console.log(result[0].total);
            //     if(result[0].total == 0){
            //          sql = "INSERT INTO sickness (Tid,Sid,Sname,sickness,passillness,other,author,tgjc) VALUES ( '"+Tid+"','"+fields.Sid+"','"+fields.Sname+"','"+fields.sickness+"','"+fields.allergy+"','"+fields.other+"','"+fields.author+"','"+fields.photo+"' );"
            //     }else{
            //          sql = 'UPDATE sickness SET tgjc="'+fields.photo+'",Sname="'+fields.Sname+'",sickness="'+fields.sickness+'",passillness="'+fields.sickness+'",other="'+fields.other+'",author="'+fields.author+'" WHERE Sid="'+fields.Sid+'";' 
                    
            //     }
            //     db.base(sql,data,(result)=>{
            //         // console.log(result);
            //         res.redirect("http://localhost:8080/sicknessadd");
            //     });
            // });
            
            let sickness = fields.sickness;
            if (sickness.match('<p>') !== null) {
                sickness = sickness.split('<p>')[1];
            }
            if (sickness.match('</p>') !== null) {
                sickness = sickness.split('</p>')[0];
            }
                

            let sql = "INSERT INTO sickness (updatatime,Tid,Sid,Sname,sickness,passillness,other,author,tgjc) VALUES ( '"+updatatime+"','"+tid+"', '"+fields.Sid+"','"+fields.Sname+"','"+sickness+"','"+fields.allergy+"','"+fields.other+"','"+fields.author+"','"+fields.photo+"' );"
            let data = [];

            db.base(sql,data,(result)=>{
                // console.log(result);
                res.redirect("http://localhost:8080/sicknessadd");
            });
            // res.send("替换")
        }
        // 添加数据
        console.log(fields)
        // res.send(fields)
        
    })

})

//删除病理信息
app.get('/delsickness',(req,res)=>{
    let param = req.query;
    
    let sql ="delete  from  sickness where Tid = '"+param.Tid+"';"   
    let data = [];
    db.base(sql,data,(result)=>{
        // console.log(result);
        res.send(result);
    });

})

//修改病理信息
app.use(upload.single('file')); //
 
app.post('/api/upload', (req, res)=>{
    let param = req.body;//获取到的age和name
    let sql = "";
    let data = [];
    // console.log(req.file.filename);//获取到的文件
    // let filename = "";
    if(req.file){
            filename = "/" +req.file.filename;
            sql = 'UPDATE sickness SET Sname="'+param.Sname+'",Sid="'+param.Sid+'",passillness="'+param.passillness+'",other="'+param.other+'",sickness="'+param.sickness+'",tgjc="'+filename+'" WHERE Tid="'+param.Tid+'";'
        }else{
            sql = 'UPDATE sickness SET Sname="'+param.Sname+'",Sid="'+param.Sid+'",passillness="'+param.passillness+'",other="'+param.other+'",sickness="'+param.sickness+'" WHERE Tid="'+param.Tid+'";'
        }
    db.base(sql,data,(result)=>{
        // console.log(result,"res");
            let sql2 ="select * from sickness WHERE Tid = '"+param.Tid+"'"
            db.base(sql2,data,(result)=>{
                // console.log(result);
                res.send(result);
            });
        
    });
  
})



//获取个人信息
app.post("/getmyinfo",(req,res)=>{
    let param = req.body;
    let sql = ""
    if(param.my_purview == "user"){
        sql ="select * from userinfo WHERE id = '"+param.my_id+"'"
    }else{
        sql ="select * from mangerinfo WHERE id = '"+param.my_id+"'"
    }
    let data = [];

    db.base(sql,data,(result)=>{
        // console.log(result);
        res.send(result);
    });

})



//修改个人信息
app.post("/editmy",function(req,res,next){
    let param = req.body;    
    let data = [param.id]
    let sql = "";
    // let list = ;
    // console.log(param)
    if(param.purview == "manger"){
        sql = 'UPDATE mangerinfo SET password="'+param.password+'",realname="'+param.realname+'",sex="'+param.sex+'",idcard="'+param.idcard+'",tel="'+param.tel+'",qq="'+param.qq+'" WHERE id="'+param.my_id+'";'
        
    }else{
        sql = 'UPDATE userinfo SET password="'+param.password+'",realname="'+param.realname+'",sex="'+param.sex+'",idcard="'+param.idcard+'",tel="'+param.tel+'",qq="'+param.qq+'" WHERE id="'+param.my_id+'";'

    }

    db.base(sql,data,(result)=>{
        // console.log(result,"res");
            res.send({
                result
            })
        
    });
    // res.send("222")
})

//获取系统信息
app.post("/getmsg",(req,res)=>{
    let param = req.body;
    let sql = "select * from message ;"    
    // sql ="select * from mangerinfo WHERE id = '"+param.my_id+"'"
    
    let data = [];
    db.base(sql,data,(result)=>{
        // console.log(result);
        res.send(result);
    });

})

//添加系统信息
app.post("/addmsg",(req,res)=>{
    let param = req.body;
    // console.log(param)
    let updatatime = sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss');

    let sql = "INSERT INTO message (title,content,author,date) VALUES ( '"+param.title+"','"+param.content+"', '"+param.author+"','"+updatatime+"' );"    
    // sql ="select * from mangerinfo WHERE id = '"+param.my_id+"'"   
    let data = [];
    db.base(sql,data,(result)=>{
        // console.log(result);
        res.send(result);
    });

})


// ====================================================

//验证登陆
app.post('/check',(req,res)=>{
    let param = req.body;
    // console.log(param.job)
    var isLogin = false
    let sql =""
    // if(param.job == ""){
    //     // return res.send("职业为空")
    // }
    if(param.job == "manger"){
         sql = 'select count(*) as total from mangerinfo where username="'+param.username+'" and password="'+param.password+'"';
    }else if(param.job == "user"){
         sql = 'select count(*) as total from userinfo where username="'+param.username+'" and password="'+param.password+'"';
    }
    let data = [param.username,param.password];

    db.base(sql,data,(result)=>{
        // console.log(result[0].total);
        if(result[0].total == 1){
            isLogin = true;
            res.send({
                isLogin:isLogin
            })
        }else{
            isLogin = false;
            res.send({
                isLogin:isLogin
            })
        }
    });
});



//用户添加申请，加入等候区
app.post('/mangeradd',(req,res)=>{
    let param = req.body;
    console.log(param)
    let uid = 1000;
    
    let sql ="INSERT INTO wait (username,password,realname,idcard,sex,tel,qq,purview) VALUES ( '"+param.username+"','"+param.password+"','"+param.realname+"','"+param.idcard+"','"+param.sex+"','"+param.tel+"','"+param.qq+"',1 );"
    res.send(param);
    let data = [param.username,param.password];

    db.base(sql,data,(result)=>{
        // res.send();
    });
})

//查询username是否在userinfo重复
app.post('/checkusername',(req,res)=>{
    let param = req.body;   
    
    let sql ="select count(*) as total from userinfo where username='"+param.username+"';"
    let data = [param.username];

    db.base(sql,data,(result)=>{
        // console.log(result[0].total);
        res.send({
            checkun:result[0].total
        })
    });
});

//查询username是否在wait重复
app.post('/checkwaitname',(req,res)=>{
    let param = req.body;
    
    
    let sql ="select count(*) as total from wait where username='"+param.username+"';"
    let data = [param.username];

    db.base(sql,data,(result)=>{
        // console.log(result[0].total);
        res.send({
            checkun:result[0].total
        })
    });
});

//查询用户的数据
app.post('/getuserinfo',(req,res)=>{
    let param = req.body;
    
    var isLogin = false
    let sql ="select * from userinfo"
    
    let data = [];

    db.base(sql,data,(result)=>{
        // console.log(result);
        res.send(result);
    });



})








//管理员审批界面查询条目，返回所有信息
app.post('/getwaitinfo',(req,res)=>{
    let param = req.body;
    
    var isLogin = false
    let sql ="select * from  wait"
    
    let data = [];
    db.base(sql,data,(result)=>{
        // console.log(result);
        res.send(result);
    });

})

//管理员审批界面查询条目，返回1条信息
app.post('/getonewait',(req,res)=>{
    let param = req.body;
    
    var isLogin = false
    let sql ="select * from  wait where username = '"+param.username+"';"
    
    let data = [];
    db.base(sql,data,(result)=>{
        console.log(result);
        res.send(result);
    });

})

//管理员审批节目删除1条数据
app.post('/delonewait',(req,res)=>{
    let param = req.body;
    
    var isLogin = false
    let sql ="delete  from  wait where username = '"+param.username+"';"
    
    let data = [];
    db.base(sql,data,(result)=>{
        console.log(result);
        res.send(result);
    });

})

//管理员审批界面数据插入用户区
app.post('/useradd',(req,res)=>{
    let param = req.body;
    
    
    // let id_num =0;
    let sql1 ="select MAX(userid) as maxid from userinfo ;"
    
    let data = [param.username,param.password];
    function checkmax(){
        return new Promise(function(resolve,reject){
            db.base(sql1,data,(result)=>{
                // console.log(result[0].maxid);
               let id_num = result[0].maxid
                resolve(++id_num);
            });

        })
    }

    async function text(){
        // getdata函数调用看能否在执行顺序中是同步结果
        let id_num = await checkmax(); //
        console.log(id_num)
        let sql2 = "INSERT INTO userinfo (userid,username,password,realname,sex,idcard,tel,qq,purview) VALUES ( '"+id_num+"','"+param.username+"','"+param.password+"','"+param.realname+"','"+param.sex+"','"+param.idcard+"','"+param.tel+"','"+param.qq+"','"+param.purview+"');"
        db.base(sql2,data,(result)=>{
            // console.log(result[0].maxid);           
            res.send(param)
        });

    }
    text();

    
});




app.listen(3002,()=>{
    console.log('running3002...');
});
