var mongo = require('mongodb'); // Mongodb modülü eklenir.
var MongoClient = require('mongodb').MongoClient; 
var settings = require("./settings.js");
var url = settings.url;
var DB = null;

function db_baglan() { // Veritabanı bağlantısı gerçekleştirilir.
	MongoClient.connect(url,function(err,db) {
		if (err) throw err;
		console.log("Database created!");
		DB = db;
		exports.DB = DB;
  });
}

function collection_add(){
	if(DB){
		DB.createCollection("tarifler",function(err,res){ // Tarifler koleksiyonu ekler.
			if(err) throw err;
			console.log("Tarifler koleksiyonu oluşturuldu.");
		});

		DB.createCollection("kullanicilar",function(err,res){ // Kullanıcılar koleksiyonu ekler.
			if(err) throw err;
			console.log("Kullanıcılar koleksiyonu oluşturuldu.");
		});
	}
}

db_baglan();

setTimeout(function(){
	collection_add();
},2000);
/*
var name = "ahmet"
if(name.search(/[^A-Za-z\s]/) != -1){
	console.log("isim değil");
}else{
	console.log("isim");
}
*/