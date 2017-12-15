"use strict"; // Strict moda alır. Kullanıcı tanımlamalarını olası hatalara karşı denetler.

// Kütüphaneler
var ObjectID = require('mongodb').ObjectID;
var express = require("express"); // Express kütüphanesini projeye dahil eder ancak bu küpüthaneyi kullanmak için konsolda npm install express --save kodu yazılmalıdır.
var validator = require('validator'); // Validator kütüphanesi projemize eklenir.Konsolda npm installa validator --save kodu yazılmalıdır.
var bodyParser = require("body-parser"); // Body-parser kütüphanesini ekler ancak bunun içinde consolda şu kodu yazmak gerekiyor. npm install body-parser --save
var isValidEmail = require('is-valid-email'); // Email kontrol kütüphanesi projeye eklenir. Ancak konsolda npm install is-valid-email --save
var alphabetical = require('is-alphabetical'); // Stringin sadece harflerden oluşumunu denetleyen kütüphane projeye dahil edilir. Yine konsolda npm install -
var app = express(); // Bir nesne türeterek express kütüphanesinin tüm metotlarına ulaşabiliyoruz.
var moment = require("moment"); // Zaman ve tarih değerleri için tanımlandı. Konsolda ki kodu : npm install moment --save
var db = require("./db.js"); // db sınıfı projeye eklenir.

// Değişkenler
var sorgu = null;
var tarif = null;
var kisi = null;
var zaman = null;

// Bu tanımlamalar gelen isteğin yada gönderilen cevabın body kısmına ulaşabilmek içindir.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(function(req, res, next) { // ?
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(function(req, res, next) { // ?
	console.log(req.method, req.originalUrl, req.body);
	next();
});

app.post("/kayit-ol",function(req,res) { // Post metodu kullanılarak kullanıcı ekleme işlemi bu blok ile gerçekleşir.
	
	var istek = req.body; // İsteğimizin parametreleri istek değişkeninde saklanır.
	// Kullanıcı bilgilerinin tümünün gelip gelmediğini kontrol ediyoruz. Tüm kullanıcı bilgileri gelmişse program akışı devam eder.
	// Aksi halde aşağıda ki if blokları ile 400 numaralı sunucusu hatası döndürür.
	
		var regEx = /^[a-zA-Z]+$/;
	function isAlpha(xStr){
		return xStr.match(regEx);
	}
	
	if(istek.isim == undefined){
		res.status(400).send("Isim bilgisi girilmelidir.");
		return
	}
	
	if(istek.soyisim == undefined){
		res.status(400).send("Soyisim bilgisi girilmelidir.");
		return
	}
	
    if(istek.eposta == undefined){
		res.status(400).send("Eposta bilgisi girilmelidir.");
		return
	}
	
    if(istek.parola == undefined){
		res.status(400).send("Parola bilgisi girilmelidir.");
		return
	}	
	
	if(isAlpha(istek.isim))
	{					
		if(istek.isim.length<2){
			res.status(400).send("Isim 2 harften az olamaz.");
			return;
		}		
	}else{
			res.status(400).send("Isim alfabetik değil.");
			return;
		}
				
	if(istek.soyisim.length<2){
		res.status(400).send("Soyisim bilgisi 2 harften az olamaz.");
		return;
	}else{
		if(!isAlpha(istek.soyisim))
		{
			res.status(400).send("Soyisim alfabetik değil.");
			return;
		}
	}
	if(!isValidEmail(istek.eposta)){
		res.status(400).send("Eposta tanımlaması uygun değil!");
		return;
	}

	if(istek.parola.length<6){
		res.status(400).send("Parola bilgisi 8 harften az olamaz.");
		return;
	}
	
	// Kullanıcıyı kaydet
	zaman = moment().format();
	kisi = {
		isim:istek.isim,
		soyisim:istek.soyisim,
		eposta:istek.eposta,
		parola:istek.parola,
		eklenmeZamani:zaman
	};
	db.DB.collection("kullanicilar").insertOne(kisi,function(err,response){
		if(err){
			res.sendStatus(500);
			return;
		}
		console.log("Kişi eklendi.");
		res.sendStatus(200);
	});	
});

app.post("/giris-yap",function(req,res) { // Post metodu kullanılarak kullanıcı giriş işlemi bu blok ile gerçekleşir.
	var istek = req.body; // İsteğimizin parametreleri istek değişkeninde saklanır.
	// Kişi bilgilerinin tümünün gelip gelmediğini kontrol ediyoruz. Tüm kişi bilgileri gelmişse program akışı devam eder.
	// Aksi halde aşağıda ki if blokları ile 400 numaralı sunucusu hatası döndürür.
	
    if(istek.eposta == undefined){
		res.status(400).send("Eposta bilgisi girilmelidir.");
		return
	}
	
    if(istek.parola == undefined){
		res.status(400).send("Parola bilgisi girilmelidir.");
		return
	}	
	
	
	if(!isValidEmail(istek.eposta)){
		res.status(400).send("Eposta tanımlaması uygun değil!");
		return;
	}else{
		if(istek.parola.length<8){
		res.status(400).send("Parola bilgisi 8 harften az olamaz.");
		return;
		}else{
			// Veritabanında böyle bir kullanıcı var mı kontrol et.
			
			sorgu = {
				eposta:istek.eposta
			};
	
			db.DB.collection("kullanicilar").findOne(sorgu,function(err,response){
				if(err){
					res.sendStatus(500);
					return;
				}
				if(response!=null){
					console.log(response);
					if(response.parola==istek.parola){
						res.end("Giriş başarılı.");
						console.log("Giriş başarılı.");
						res.sendStatus(200);
					}	
					else{
						res.end("Parola yanlış!");
						console.log("Parola yanlış!");						
					}
				}
				else{
					res.end("Kullanici adi gecersiz!");
					console.log("Kullanici adi gecersiz!");
				}
			});
		}
	}
});

app.get("/kullanicilar",function(req,res) {	// Bu metot ile tüm tarifleri listelemeyi sağlarız
	
	db.DB.collection("kullanicilar").find({}).toArray(function(err,response){
		if(err){
			res.sendStatus(500);
			return;
		}
		res.json(response);
	});
});

app.get("/yokEt",function(req,res) {	// Bu metot ile tüm tarifleri listelemeyi sağlarız
	
	db.DB.collection("kullanicilar").drop(function(err,delOK){
		
		if(err){
			res.sendStatus(500);
			return;
		}
	});
	db.DB.collection("tarifler").drop(function(err,delOK){
		if(err){
			res.sendStatus(500);
			return;
		}				
	});
	
	res.sendStatus(200);
});

app.post("/tarif-ekle",function(req,res) { // Post metodu kullanılarak tarif ekleme işlemi bu blok ile gerçekleşir.
	
	var istek = req.body; // İsteğimizin parametreleri istek değişkeninde saklanır.
	// Tarif bilgilerinin tümünün gelip gelmediğini kontrol ediyoruz. Tüm tarif bilgileri gelmişse program akışı devam eder.
	// Aksi halde aşağıda ki if blokları ile 400 numaralı sunucusu hatası döndürür.
	if(istek.isim == undefined){
		res.status(400).send("Isim bilgisi girilmelidir.");
		return;
	}
	else if(istek.malzemeler == undefined){
		res.status(400).send("Malzemeler bilgisi girilmelidir.");
		return
	}
	else if(istek.talimatlar == undefined){
		res.status(400).send("Talimatlar bilgisi girilmelidir.");
		return
	}
	else if(istek.kategori == undefined){
		res.status(400).send("Kategori bilgisi girilmelidir.");
		return
	}
	else if(istek.hazirlamaSuresi == undefined){
		res.status(400).send("Hazırlama süresi bilgisi girilmelidir.");
		return
	}
	else if(istek.pisirmeSuresi == undefined){
		res.status(400).send("Pişirme süresi bilgisi girilmelidir.");
		return
	}
	else if(istek.kacKisilik == undefined){
		res.status(400).send("Kaç kişilik olduğu bilgisi girilmelidir.");
		return
	}
	
	var aciklama = "";
    if(istek.aciklama == undefined){
	}
	
	zaman = moment().format(); // Anlık zaman bilgisi tutulmaktadır.
	tarif = {
		isim:istek.isim,
		malzemeler:istek.malzemeler,
		talimatlar:istek.talimatlar,
		kategori:istek.kategori,
		hazirlamaSuresi:istek.hazirlamaSuresi,
		pisirmeSuresi:istek.pisirmeSuresi,
		kacKisilik:istek.kacKisilik,
		aciklama:aciklama,
		aktifMi:true,
		eklenmeZamani:zaman
	};
	
	db.DB.collection("tarifler").insertOne(tarif,function(err,response){
		if(err) {
			res.sendStatus(500);
			return;
		}
		console.log("Tarif eklendi.");
		res.sendStatus(200);
	});
});

app.get("/tarifler",function(req,res) {	// Bu metot ile tüm tarifleri listelemeyi sağlarız
	
	db.DB.collection("tarifler").find({}).toArray(function(err,response){
		if(err){
			res.sendStatus(500);
			return;
		}
		res.json(response);
	});
});

app.get("/tarif",function(req,res) { // Tıklanan tarifi gönderen metot
	var istek = req.query;
	if(istek.id == undefined){ // Açılması istenen tarifin id değerinin tanımlı olması gerekir. Aksi halde hata mesajı döndürür.
		res.status(400).send("Id bilgisi girilmelidir.");
		return;
	}
	sorgu = {
		_id:ObjectID(istek.id)
	};
	db.DB.collection("tarifler").find(sorgu).toArray(function(err,response){
		if(err){
			res.sendStatus(500);
			return;
		}
		res.json(response);
	});
});

app.post("/tarif-guncelle",function(req,res) { // Tarif güncelleme metodu.
	var istek = req.body; // Sunucuya gönderilen istediğin parametreleri istek değişkenine aktarılır.
	
	// Parametrelerin içinde tüm tarif bilgilerinin varlığı kontrol edilir. Yoksa 400 numaralı sunucu hatası döndürür.
	// Tüm veriler mevcutsa program akışı devam eder.
	if(istek.id == undefined){
		res.status(400).send("Id bilgisi girilmelidir.");
		return;
	}
	else if(istek.isim == undefined){
		res.status(400).send("Isim bilgisi girilmelidir.");
		return;
	}
	else if(istek.malzemeler == undefined){
		res.status(400).send("Malzemeler bilgisi girilmelidir.");
		return
	}
	else if(istek.talimatlar == undefined){
		res.status(400).send("Talimatlar bilgisi girilmelidir.");
		return
	}
	else if(istek.kategori == undefined){
		res.status(400).send("Kategori bilgisi girilmelidir.");
		return
	}
	else if(istek.puan == undefined){
		res.status(400).send("Puan bilgisi girilmelidir.");
		return
	}
	else if(istek.hazirlamaSuresi == undefined){
		res.status(400).send("Hazırlama süresi bilgisi girilmelidir.");
		return
	}
	else if(istek.pisirmeSuresi == undefined){
		res.status(400).send("Pişirme süresi bilgisi girilmelidir.");
		return
	}
	else if(istek.kacKisilik == undefined){
		res.status(400).send("Kaç kişilik olduğu bilgisi girilmelidir.");
		return
	}
	else if(istek.aciklama == undefined){
		res.status(400).send("Açıklama bilgisi girilmelidir.");
		return
	}
	
	sorgu = {
		_id:ObjectID(istek.id)
	};
	var guncelDeger = {
		isim:istek.isim,
		malzemeler:istek.malzemeler,
		talimatlar:istek.talimatlar,
		kategori:istek.kategori,
		puan:istek.puan,
		hazirlamaSuresi:istek.hazirlamaSuresi,
		pisirmeSuresi:istek.pisirmeSuresi,
		kacKisilik:istek.kacKisilik,
		aciklama:istek.aciklama,
	};
	db.DB.collection("tarifler").updateOne(sorgu,guncelDeger,function(err,response){
		if(err) throw err;
		console.log("Guncelleme başarılı.");
		res.sendStatus(200);
	});
});

app.get("/tarif-ara",function(req,res) { // Tarif arama işlemlerini gerçekleştiren metot
	var istek = req.query;
	if(istek.isim == undefined){ // Aranan tarifin isminin tanımlı olması gerekir. Aksi halde hata mesajı döndürür.
		res.status(400).send("Isim bilgisi girilmelidir.");
		return;
	}
	
	var isim = istek.isim;
	var regex = {isim:{$regex:".*"+isim+".*"}};
	
	db.DB.collection("tarifler").find(regex).toArray(function(err,response){
		if(err){
			console.log(err);
			res.sendStatus(500);
			return;
		}
		res.json(response);
	});
});

app.listen(8080);	// Uygulamam sürekli bu portu dinleyerek gelen isteklere cevap verir.