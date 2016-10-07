
'use strict';const express=require('express');const mongodb=require('mongodb');const path=require('path');const cors=require('cors');const q=require('q');const bodyparser=require('body-parser');const crypto=require('crypto');const wrapper=function(){let shasum=crypto.createHash('sha1');const config=require('./config.json');const server=express();const router=express.Router();const sessions={};const mongoClient=mongodb.MongoClient;server.use(cors());server.use(bodyparser.urlencoded({extended:true}));server.use(bodyparser.json());server.use(router);server.use(express.static(path.join(__dirname,'/front/public')));server.get('',function(req,res){res.sendFile(path.join(__dirname+'/front/index.html'));});server.listen(config.port,function(){console.log("["+config.instance+"] >> started server on port "+config.port);});function FindToken(login,token){let deferred=q.defer();mongoClient.connect(config.database,function(error,db){if(error)deferred.reject(error);else{db.collection('users').findOne({"login":login,"token":token},{_id:0},function(error,result){db.close();if(error)deferred.reject(error);else if(result!=null)deferred.resolve(result);else deferred.reject();});};});return deferred.promise;};function AuthenticationBySessionKey(key,ip){let result=false;if(sessions[key]==ip){result=true;};return result;};function GetAuthenticationLog(period){let deferred=q.defer();let query={}
if(period){query={date:{}};if(period.sdate)query.date.$gte=period.sdate;if(period.edate)query.date.$lt=period.edate;};mongoClient.connect(config.database,function(error,db){if(error)deferred.reject(error);else{db.collection('log').find(query,{"_id":0}).toArray(function(error,result){db.close();if(error)deferred.reject(error);else deferred.resolve(result);});};});return deferred.promise;};function LogAuthentication(ip,login,status){let deferred=q.defer();mongoClient.connect(config.database,function(error,db){if(error)deferred.reject(error);else{db.collection('log').insert({"ip":ip,"login":login,"status":status,"date":new Date()},function(error,result){db.close();if(error)deferred.reject(error);else deferred.resolve(result);});};});return deferred.promise;};function GetGroup(id){let deferred=q.defer();mongoClient.connect(config.database,function(error,db){if(error)deferred.reject(error);else{db.collection('groups').findOne({"id":id},{"_id":0},function(error,result){db.close();if(error)deferred.reject(error);else deferred.resolve(result);});};});return deferred.promise;};function GetGroupsList(){let deferred=q.defer();mongoClient.connect(config.database,function(error,db){if(error)deferred.reject(error);else{db.collection('groups').find({},{"_id":0}).toArray(function(error,result){db.close();if(error)deferred.reject(error);else deferred.resolve(result);});};});return deferred.promise;};function EditGroup(group){let deferred=q.defer();mongoClient.connect(config.database,function(error,db){if(error)deferred.reject(error);else{db.collection('groups').update({"id":group.id},{$set:group},{upsert:true},function(error,result){db.close();if(error)deferred.reject(error);else deferred.resolve();});};});return deferred.promise;};function GetUserInfo(login){let deferred=q.defer();mongoClient.connect(config.database,function(error,db){if(error)deferred.reject(error);else{db.collection('users').findOne({"login":login},{_id:0,token:0},function(error,result){db.close();if(error)deferred.reject(error);else if(result!=null)deferred.resolve(result);else deferred.reject();});};});return deferred.promise;};function CreateNewUser(user){let deferred=q.defer();mongoClient.connect(config.database,function(error,db){if(error)deferred.reject(error);else{let token=crypto.createHash('sha1').update(user.password).digest('hex');let userInfo={login:user.login,token:token,name:user.name,surname:user.surname,patronymic:user.patronymic,email:user.email};db.collection('users').update({"login":user.login},{$set:userInfo},{upsert:true},function(error,result){db.close();if(error)deferred.reject(error);else deferred.resolve();});};});return deferred.promise;};function EditUser(user){let deferred=q.defer();mongoClient.connect(config.database,function(error,db){if(error)deferred.reject(error);else{db.collection('users').update({"login":user.login},{$set:user},function(error,result){db.close();if(error)deferred.reject(error);else deferred.resolve();});};});return deferred.promise;};function DeleteUser(login){let deferred=q.defer();mongoClient.connect(config.database,function(error,db){if(error)deferred.reject(error);else{db.collection('users').remove({"login":login},function(error,result){db.close();if(error)deferred.reject(error);else deferred.resolve();});};});return deferred.promise;};function GetUsersList(){let deferred=q.defer();mongoClient.connect(config.database,function(error,db){if(error)deferred.reject(error);else{db.collection('users').find({},{"_id":0,"token":0}).toArray(function(error,result){db.close();if(error)deferred.reject(error);else deferred.resolve(result);});};});return deferred.promise;};server.post('/authenticate',function(req,res){let data=req.body;if(data.login&&data.password){let hash=crypto.createHash('sha1').update(data.password).digest('hex');FindToken(data.login,hash).then((result)=>{LogAuthentication(req.ip,data.login,200).then((result)=>{let sessionKey=crypto.randomBytes(64).toString('Base64')+crypto.randomBytes(64).toString('Base64')+crypto.randomBytes(64).toString('Base64');sessions[sessionKey]=req.ip;res.status(200).send(sessionKey);}).catch((error)=>{res.status(500).send(error);});}).catch((error)=>{LogAuthentication(req.ip,data.login,401).then((result)=>{res.status(401).send();}).catch((error)=>{res.status(500).send(error);});});}
else{LogAuthentication(req.ip,null,400).then((result)=>{res.status(400).send("<h1>400 Bad request</h1>");}).catch((error)=>{console.log(3);res.status(500).send(error);});};});server.post('/approve',function(req,res){let data=req.body;if(data.session&&AuthenticationBySessionKey(data.session,req.ip)){res.status(200).send('ok');}
else res.status(400).send("<h1>400 Bad request</h1>");});server.post('/logout',function(req,res){let data=req.body;if(data.session&&AuthenticationBySessionKey(data.session,req.ip)){delete sessions[data.session];res.status(200).send("ok");}
else res.status(400).send("<h1>400 Bad request</h1>");});server.post('/endpoints',function(req,res){let data=req.body;if(data.session&&AuthenticationBySessionKey(data.session,req.ip)){res.status(200).send(config.apiEndpoints)}
else res.status(400).send("<h1>400 Bad request. Session key required.</h1>");});server.post('/groupsList',function(req,res){let data=req.body;if(data.session&&AuthenticationBySessionKey(data.session,req.ip)){GetGroupsList().then((result)=>{res.status(200).send(result)}).catch((error)=>{if(error)res.send(error);else res.status(401).send();});}
else res.status(400).send("<h1>400 Bad request</h1>");});server.post('/newGroup',function(req,res){let data=req.body;if(data.group&&data.session&&AuthenticationBySessionKey(data.session,req.ip)){EditGroup(data.group).then((result)=>{res.status(200).send("ok")}).catch((error)=>{if(error)res.send(error);else res.status(401).send();});}
else res.status(400).send("<h1>400 Bad request</h1>");});server.post('/group',function(req,res){let data=req.body;if(data.id&&data.session&&AuthenticationBySessionKey(data.session,req.ip)){GetGroup(data.id).then((result)=>{res.status(200).send(result)}).catch((error)=>{if(error)res.send(error);else res.status(401).send();});}
else res.status(400).send("<h1>400 Bad request</h1>");});server.post('/logs',function(req,res){let data=req.body;if(data.session&&AuthenticationBySessionKey(data.session,req.ip)){var period={sdate:new Date(data.sdate),edate:new Date(data.edate)};GetAuthenticationLog(period).then((result)=>{res.status(200).send(result)}).catch((error)=>{if(error)res.send(error);else res.status(401).send();});}
else res.status(400).send("<h1>400 Bad request</h1>");});server.post('/userInfo',function(req,res){let data=req.body;if(data.login&&data.session&&AuthenticationBySessionKey(data.session,req.ip)){GetUserInfo(data.login).then((result)=>{res.status(200).send(result)}).catch((error)=>{if(error)res.send(error);else res.status(401).send();});}
else res.status(400).send("<h1>400 Bad request</h1>");});server.post('/newUser',function(req,res){let data=req.body;if(data.user&&data.session&&AuthenticationBySessionKey(data.session,req.ip)){CreateNewUser(data.user).then((result)=>{res.status(200).send("ok")}).catch((error)=>{if(error)res.send(error);else res.status(401).send();});}
else res.status(400).send("<h1>400 Bad request</h1>");});server.post('/editUser',function(req,res){let data=req.body;if(data.user&&data.session&&AuthenticationBySessionKey(data.session,req.ip)){EditUser(data.user).then((result)=>{res.status(200).send("ok")}).catch((error)=>{if(error)res.send(error);else res.status(401).send();});}
else res.status(400).send("<h1>400 Bad request</h1>");});server.post('/deleteUser',function(req,res){let data=req.body;if(data.login&&data.session&&AuthenticationBySessionKey(data.session,req.ip)){DeleteUser(data.login).then((result)=>{res.status(200).send("ok")}).catch((error)=>{if(error)res.send(error);else res.status(401).send();});}
else res.status(400).send("<h1>400 Bad request</h1>");});server.post('/usersList',function(req,res){let data=req.body;if(data.session&&AuthenticationBySessionKey(data.session,req.ip)){GetUsersList().then((result)=>{res.status(200).send(result)}).catch((error)=>{if(error)res.send(error);else res.status(401).send();});}
else res.status(400).send("<h1>400 Bad request</h1>");});}
module.exports=new wrapper();