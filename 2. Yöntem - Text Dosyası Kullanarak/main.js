"use strict"; // Strict moda alır. Kullanıcı tanımlamalarını olası hatalara karşı denetler.
console.log('Server çalıştırıldı.'); //Konsolda parametre olarak verilen değeri yazdırır.
var express = require("express"); // Express kütüphanesini projeye dahil eder ancak bu küpüthaneyi kullanmak için konsolda npm install express kodu yazılmalıdır.
var fs = require("fs"); // Dosya işlemleri içinde bu kütüphaneyi tanımlamamız gerekiyor.
var validator = require('validator');
var bodyParser = require("body-parser"); // Kütüphanesini ekler ancak bunun içinde aşağıda ki kodu consolda yazmak gerekiyor.
// npm install body-parser
 
var isValidEmail = require('is-valid-email');
 
var alphabetical = require('is-alphabetical');
var app = express(); // Bir nesne türeterek express kütüphanesinin tüm metotlarına ulaşabiliyoruz.

// Bu tanımlamalar gelen isteğin yada gönderilen cevabın body kısmına ulaşabilmek içindir.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
 


fs.readFile("tarif.json", "utf8", function (ex, data) 
	{	// Dosya okunarak tüm tarifler data değişkeninde saklanır.	
		if (ex) 
		{	// Hata olursa bu blok çalışır.
			console.log("Dosya okumada hata oluştu!");
			res.status(500).send("Dosya okumada hata oluştu!");
		} else 
		{		// Hata yoksa bu blok çalışır.
	
				fs.exists("db", function (val) { // Bu metot kök dizinde 'db' adında bir dosya olup olmadığını kontrol eder. 
				//Sonucu boolean tipinde val değişkenine aktarır.
			 
				if (val) { // Eğer böyle bir dosya varsa bu blok çalışır.
					console.log("Veritabanı dizini mevcut.");
					fs.exists("db/database.json", function(val){ // Bu dosyanın içinde de 'database.json' dosyasının olup olmadığına bakar.
						if(val){ // Böyle bir dosya varsa bu satır çalışır.
							console.log("Veritabanı dosyası mevcut.");
						}else{ // Yoksa oluşturulmak üzere bu blok çalışır.
							fs.writeFile("db/database.json",data, function (ex){ // db klasörünün içinde database.json dosyası oluşrularak içerisine
							// data değeri yazılır.
								if (ex) { // Hata oluşursa bu blok çalışır.
									console.log("Veritabanı dosyası oluşturulamadı.");
									res.status(500).send("Veritabanı dosyası oluşturulamadı.");
								}
								else{ // Hata yoksa bu blok çalışır.
									console.log("Veritabanı dosyası da oluşturuldu.");
								}
							});
						}
					});
				} else { // Eğer kök dizinde db adında klasör yoksa bu blok çalışır.
					fs.mkdir("db", function (ex) 
							{ // db adında bir klasör oluşturulur.
								if (ex) { // Hata oluşursa bu satır çalışır.
									console.log("Veritabanı dizini oluşturulamadi.");
									res.status(500).send("Veritabanı dizini oluşturulamadi.");

								}else{ // Hata oluşmazsa bu satır çalışır.
									console.log("Veritabanı dizini oluşturuldu.");
									fs.writeFile("db/database.json",data, function (ex) 
									{ // db klasörünün içerisinde database.json dosyası oluşturularak içerisine data değeri eklenir.
										if (ex) {
											console.log("Veritabanı dosyası oluşturulamadı.");
											res.status(500).send("Veritabanı dosyası oluşturulamadı.");
										}
										else{
											console.log("Veritabanı dosyası da oluşturuldu.");
										}
									});
								}
							});
				}
			});
		}
	});

app.use(function(req, res, next) {
	console.log(req.method, req.originalUrl, req.body);
	next();
});

app.get("/test",function(req,res)
{	// Tıklanan tarifi gönderen metot
	res.send("Server is running");
});
	
app.get("/tarifler",function(req,res)
{	// Bu metot ile tüm tarifleri listelemeyi sağlarız
	fs.readFile("db/database.json", "utf8", function (ex, data) 
	{	// Dosya okunarak tüm tarifler data değişkeninde saklanır.	
		if (ex) 
		{	// Hata olursa bu blok çalışır.
			console.log("Dosya okumada hata oluştu!");
			res.status(500).send("Dosya okumada hata oluştu!");
		} else 
		{		// Hata yoksa bu blok çalışır.
	
				var parametre = req.query;
				if(parametre.kategori == undefined){ // Kategori parametresi tanımlı değilse tüm tarifler cevap olarak döndürülür.

					var tarifler = [];
					var d;
					d = JSON.parse(data); // Dosyada ki veriler Json farmatına çevrilerek diziye aktarılır.
					tarifler = d; // Tüm tarifler tarifler dizisine aktarılır
					console.log(tarifler);
					res.send(tarifler); // Tarifler dizim cevap olarak web sayfasına gönderilir.
				}else{	// Kategori parametresi tanımlı ise veritabanında o kategori de kaydedilmiş tüm tarifler listelenir.
					
								var tarifler = [];
								var d;
								d = JSON.parse(data); 
									var sonuclar = [];
									tarifler = d;	// Dosyada ki tüm tarifler tarifler dizisine aktarılır.
									for(var i = 0;i<tarifler.length;i++){
										var tarifKategori = tarifler[i].kategori; // Tüm tariflerin kategorileri bu değişkene aktarılır.
										var istekKategori = parametre.kategori; // Web sayfasından gelen kategori parametresi bu değişkene aktarılır.
								
										if(istekKategori == tarifKategori){ // Sonuç doğru ise eşleşme var demektir.
											sonuclar.push(tarifler[i]); // Eşleşen tarifler diziye eklenir.
										}
									}
									if(sonuclar.length > 0) { // Dizi boyutu sıfırdan büyükse o halde dizide elaman var demektir.					
										res.json(sonuclar); // Dizi Json formatına çevrilerek cevap olarak gönderilir.
										console.log(sonuclar)
									} else { // Dizinin boyutu sıfır ise bu kategoride tarifin listede olmadığını gösterir.		
										res.status(400).send("Eslesme yok");
										console.log("Eslesme yok")
									}						
				}			
		}
	});
});

app.get("/tarif",function(req,res)
{	// Tıklanan tarifi gönderen metot
	var c = req.query;
	console.log(c)
	if(c.id == undefined){ // Açılması istenen tarifin id değerinin tanımlı olması gerekir. Aksi halde hata mesajı döndürür.
		res.status(400).send("Id bilgisi girilmelidir.");
		return;
	}
	
	fs.readFile("db/database.json", "utf8", function (ex, data) 
	{		
		if (ex) 
		{
			console.log("Dosya okumada hata oluştu!");
			res.status(500).send("Dosya okumada hata oluştu!");
		} else 
		{		var tarif = "Eslesme yok";
				var tarifler = [];
				var d;
				d = JSON.parse(data); 
					var z = [];
					tarifler = d;
					for(var i = 0;i<tarifler.length;i++){
						var tarifID = tarifler[i].id; // Tüm tarif id değerleri bu değişkene aktarılır.
						var istekID = c.id; // Web sayfasından gelen id tüm tariflerin id değerleri ile karşılaştırılır.

						if(istekID == tarifID){ // Sonuç doğru ise eşleşme var demektir.
							var tarif = tarifler[i]; // Eşleşen tarif yanıt olarak gönderilir.
							console.log(tarif)
						}
					}
					if(tarif == "Eslesme yok") {	// Dizinin boyutu sıfır ise bu aradığımız tarifin listesinde olmadığını gösterir.
						res.status(400).send("Eslesme yok.");
					} else { // Ancak dizi boyutu sıfırdan büyükse o halde dizide elaman var demektir.
						res.json(tarif); // Dizi Json formatına çevrilerek cevap olarak gönderilir.
					}						
		}
	});
});

app.get("/ensevilenler",function(req,res)
{	// En sevilen tarifleri gönderen metot
	// Bu metodu kullanabilmek için en sevilen tariflerden kaç tanesinin görüntüleneceğini belirten adet değeri de girilmelidir.
	var c = req.query;
	console.log(c)
	if(c.adet == undefined){ // En sevilen tarifler için bir adet değeri girilmelidir. Yani en fazla kaç tarif gönderilecektir.
	// Aksi halde hata mesajı döndürür.
		res.status(400).send("Adet bilgisi girilmelidir.");
		return;
	}
	
	fs.readFile("db/database.json", "utf8", function (ex, data) 
	{	// Dosya okuma işlemi yapılmaktadır.	
		if (ex) 
		{
			console.log("Dosya okumada hata oluştu!"); // Hata varsa hata mesajı döndürür.
			res.status(500).send("Dosya okumada hata oluştu!"); // Hata varsa hata mesajı döndürür.
		} else 
		{
				var tarifler = [];
				var d;
				d = JSON.parse(data); // Dosyada ki okunan veriler Json formatına çevrilir.
					var araSonuclar = [];	
					var sonuclar = [];
					var puanDizi = []; // Tüm tariflerin puanları bu dizi de saklanacaktır.
					tarifler = d;	// Dosyada ki tüm tarifler bu dizide saklanacaktır
					for(var i = 0;i<tarifler.length;i++){
						var tarifPuan = tarifler[i].puan; // Tüm tarif puanları bu değişkene aktarılır.
						var maxPuan = 0; // Maximum puan değeri bu değişkende saklanacaktır.
						if( maxPuan < tarifPuan ){ // Tüm tariflerin puanı ile maximum puan değeri karşılaştırılarak maximum puan
							// değeri tespit edilir.
							maxPuan = tarifPuan
							puanDizi.push(maxPuan); // Tariflerin puanları büyükten küçüğe doğru diziye aktarılacaktır
						}						
					}
					
					var tarifPuan = 0;		
					for(var j = (puanDizi.length-1);j>=0;j--){
						for(var i = 0;i<tarifler.length;i++){
							tarifPuan =  tarifler[i].puan; // Tüm tarif puanları bu değişkene aktarılır.		
							if(tarifPuan >= puanDizi[j]){
								araSonuclar.push(tarifler[i]);
							}	
						}
					}				
					
					if(araSonuclar.length > 0) { // Ancak dizi boyutu sıfırdan büyükse o halde dizide elaman var demektir.					
						var sayac = c.adet;
						if(sayac>araSonuclar.length){
							sayac = araSonuclar.length
						}
						for(var x =0;x<sayac;x++){
							sonuclar.push(araSonuclar[x]);
						}
						sonuclar.reverse();
						res.json(sonuclar); // Dizi Json formatına çevrilerek cevap olarak gönderilir.
						
					} else { // Dizinin boyutu sıfır ise bu kategoride tarifin listede olmadığını gösterir.		
						res.status(400).send("Eslesme yok");
						console.log("Eslesme yok")
					}						
		}
	});
});

app.post("/tarif-ekle",function(req,res)
{	// Post metodu kullanılarak tarif ekleme işlemi bu blok ile gerçekleşir.
	
	console.log(req.body); // Sunucuya gönderilen isteğin parametrelerini gösterir.
	var c = req.body; // İsteğimizin parametreleri c değişkeninde saklanır.
	// Tarif bilgilerinin tümünün gelip gelmediğini kontrol ediyoruz. Tüm tarif bilgileri gelmişse program akışı devam eder.
	// Aksi halde aşağıda ki if blokları ile 400 numaralı sunucusu hatası döndürür.
	if(c.isim == undefined){
		res.status(400).send("Isim bilgisi girilmelidir.");
		return;
	}
	else if(c.malzemeler == undefined){
		res.status(400).send("Malzemeler bilgisi girilmelidir.");
		return
	}
	else if(c.talimatlar == undefined){
		res.status(400).send("Talimatlar bilgisi girilmelidir.");
		return
	}
	else if(c.kategori == undefined){
		res.status(400).send("Kategori bilgisi girilmelidir.");
		return
	}
	else if(c.puan == undefined){
		res.status(400).send("Puan bilgisi girilmelidir.");
		return
	}
	
	fs.readFile("db/database.json", "utf8", function (ex, data) 
	{	// Dosya okuma işlemi yapar	
		if (ex) 
		{ 	// Dosya okunamadıysa hata döndürür
			console.log("Dosya okumada hata oluştu!");
			res.status(500).send("Dosya okumada hata oluştu!");
		} else 
		{		//Dosya okuma işleminde hata yoksa bu blok çalışır.
				var tarifler = []; // Dosyada daha önce saklanan tarler bu diziye aktarılacaktır. Bu yüzden bu dizi tanımlanmıştır.
				var d; // Okunan veriyi saklamak için tanımlandı.
				d = JSON.parse(data); // Okunan veri önce data değişkeninde saklanır sonrada bu satır ile d değişkenine aktarılacaktır
					tarifler = d; // Dosyada ki tüm kişileri diziye aktarır.
					
					/* Web uygulaması üzerinden her kaydın id değerine sıfır değerini veriyorduk. 
					  Bu veri sunucuya gelmeden önce ise listede ki en büyük veri tespit edildikten sonra onun bir fazlası 
					  ile değiştirilir. Yani özetle dosyada hiç veri olsun yada olmasın web uygulaması üzerinde tarifin id 
					  değerine sıfır değeri verilir. Sonra uygulama üzerinden tüm kayıtların id numarasını gezerek en büyük 
					  id değeri bulunur ve bunun bir fazlası ile değiştirilir. Bu sayede veritabanında id otamatik artışına
					  benzer bir yapı kurulmuş olur. Aşağıda ki kodlar da bu yapıyı sağlar. */
					var id = 0
					var max =0
					for(var i=0;i<tarifler.length;i++){
						id = tarifler[i].id
						if(id>max){
							max = id
						}
					}
					max++;
					c.id = max
		}
				tarifler.push(c); // Diziye web uygulamadan gelen tarif verileri eklenir.
				d = JSON.stringify(tarifler); // Dizi string tipine çevrilir. Daha sonra d değişkenine aktarılır.
				fs.writeFile("db/database.json",d, function (ex) 
				{	// Dosyaya tarif listemizin son hali yazılır.
					if (ex) 
					{
						console.log("Tarif eklenemedi!");
						res.status(400).send("Tarif eklenemedi!");
					}else
					{
						res.end("Tarif eklendi.");
						console.log("Tarif eklendi.");
					}
				});				
		
	});
});

app.post("/kayit-ol",function(req,res)
{	// Post metodu kullanılarak tarif ekleme işlemi bu blok ile gerçekleşir.
	
	console.log(req.body); // Sunucuya gönderilen isteğin parametrelerini gösterir.
	var c = req.body; // İsteğimizin parametreleri c değişkeninde saklanır.
	// Tarif bilgilerinin tümünün gelip gelmediğini kontrol ediyoruz. Tüm tarif bilgileri gelmişse program akışı devam eder.
	// Aksi halde aşağıda ki if blokları ile 400 numaralı sunucusu hatası döndürür.
	
	var isim = c.isim;
	var soyisim = c.soyisim;
	var eposta = c.eposta;
	var parola = c.parola;
	
	function isAlpha(xStr){
		var regEx = /^[a-zA-Z]+$/;
		return xStr.match(regEx);
	}
	
	if(c.isim == undefined){
		res.status(400).send("Isim bilgisi girilmelidir.");
		return
	}
	
	if(c.soyisim == undefined){
		res.status(400).send("Soyisim bilgisi girilmelidir.");
		return
	}
	
    if(c.eposta == undefined){
		res.status(400).send("Eposta bilgisi girilmelidir.");
		return
	}
	
    if(c.parola == undefined){
		res.status(400).send("Parola bilgisi girilmelidir.");
		return
	}	
	
	if(isAlpha(isim))
	{					
		if(isim.length<2){
			res.status(400).send("Isim 2 harften az olamaz.");
			return;
		}		
	}else{
			res.status(400).send("Isim alfabetik değil.");
			return;
		}
				
	if(soyisim.length<2){
		res.status(400).send("Soyisim bilgisi 2 harften az olamaz.");
		return;
	}else{
		if(!isAlpha(soyisim))
		{
			res.status(400).send("Soyisim alfabetik değil.");
			return;
		}
	}
	if(!isValidEmail(eposta)){
		res.status(400).send("Eposta tanımlaması uygun değil!");
		return;
	}

	if(parola.length<8){
		res.status(400).send("Parola bilgisi 8 harften az olamaz.");
		return;
	}
	
	// Kullanıcıyı kaydet
	res.sendStatus(200);
	
});

app.post("/giris-yap",function(req,res)
{	// Post metodu kullanılarak tarif ekleme işlemi bu blok ile gerçekleşir.
	
	console.log(req.body); // Sunucuya gönderilen isteğin parametrelerini gösterir.
	var c = req.body; // İsteğimizin parametreleri c değişkeninde saklanır.
	// Tarif bilgilerinin tümünün gelip gelmediğini kontrol ediyoruz. Tüm tarif bilgileri gelmişse program akışı devam eder.
	// Aksi halde aşağıda ki if blokları ile 400 numaralı sunucusu hatası döndürür.
	
	var eposta = c.eposta;
	var parola = c.parola;
	
    if(c.eposta == undefined){
		res.status(400).send("Eposta bilgisi girilmelidir.");
		return
	}
	
    if(c.parola == undefined){
		res.status(400).send("Parola bilgisi girilmelidir.");
		return
	}	
	
	
	if(!isValidEmail(eposta)){
		res.status(400).send("Eposta tanımlaması uygun değil!");
		return;
	}else{
		if(parola.length<8){
		res.status(400).send("Parola bilgisi 8 harften az olamaz.");
		return;
		}else{
			// Veritabanında böyle bir kullanıcı var mı kontrol et.
			res.sendStatus(200);
		}
	}

	
	
});

app.get("/tarif-sil",function(req,res)
{	// Tarif silme işlemini yapacağımız metot
	var c = req.query; // İsteğimizin tüm parametreleri c değişkenine yüklenir.
	
	if(c.id == undefined){ // Silinecek tarifin id değerinin var olup olmadığını kontrol eder.
		res.status(400).send("Id bilgisi girilmelidir.");
		return;
	}
	
	fs.readFile("db/database.json", "utf8", function (ex, data) 
	{	// Dosyayı okuma işlemi yapılır. Okunan veriler data değişkeninde saklanır.	
	
		if (ex){	// Hata oluşursa bu blok çalışır.
		
			console.log("Dosya okumada hata oluştu!"); // Hata mesajı döndürür.
			res.status(500).send("Dosya okumada hata oluştu!"); // Hata mesajı döndürür.
			
		} else {	// Hata yoksa bu blok çalışır.
		
			var tarifler = [];
			var d;
			d = JSON.parse(data);
			tarifler = d;
			for(var i = 0;i<tarifler.length;i++){ // Web sayfasından gelen id değeri ile tüm tariflerin id değeri eşit mi diye
			// kontrol edilir. Eşleşen tarif diziden silinir.
				var k = tarifler[i].id;
				var l = c.id; // Web sayfasından gelen id
				if(k == l){	// Tüm tarif verileri ile web sayfasından gelen id karşılaştırılır.
					tarifler.splice(i, 1);  // Silme işlemi bu satırda yapılır.
				}
			}
			d = JSON.stringify(tarifler); // Güncel tarifler dizisi string tipinde d değişkenine aktarılır.
			fs.writeFile("db/database.json",d, function (ex) 
			{	// Güncel tarifler listesi dosyaya yazdırılır.
				if (ex) 
				{	// Hata varsa bu blok çalışır
					console.log("Silme işlemi başarısız.");
					res.status(400).send("Silme islemi basarisiz.");
				}else
				{	// Hata yoksa bu blok çalıştırılır.
					res.end("Silme islemi basarili."); 	// Sunucuya gönderilen veri
					console.log("Silme işlemi başarılı.");
				}
			});				
		}
	});
});

app.get("/malzeme-sil",function(req,res)
{	// Tarif silme işlemini yapacağımız metot
	var c = req.query; // İsteğimizin tüm parametreleri c değişkenine yüklenir.
	
	if(c.id == undefined){ // Silinecek tarifin id değerinin var olup olmadığını kontrol eder.
		res.status(400).send("Id bilgisi girilmelidir.");
		return;
	}else if(c.konum == undefined){ // Silinecek tarifin id değerinin var olup olmadığını kontrol eder.
		res.status(400).send("Konum bilgisi girilmelidir.");
		return;
	}
	
	fs.readFile("db/database.json", "utf8", function (ex, data) 
	{	// Dosyayı okuma işlemi yapılır. Okunan veriler data değişkeninde saklanır.	
	
		if (ex){	// Hata oluşursa bu blok çalışır.
		
			console.log("Dosya okumada hata oluştu!"); // Hata mesajı döndürür.
			res.status(500).send("Dosya okumada hata oluştu!"); // Hata mesajı döndürür.
			
		} else {	// Hata yoksa bu blok çalışır.
		
			var tarifler = [];
			var d;
			d = JSON.parse(data);
			tarifler = d;
			for(var i = 0;i<tarifler.length;i++){ // Web sayfasından gelen id değeri ile tüm tariflerin id değeri eşit mi diye
			// kontrol edilir. Eşleşen tarif diziden silinir.
				var k = tarifler[i].id;
				var l = c.id; // Web sayfasından gelen id
				if(k == l){	// Tüm tarif verileri ile web sayfasından gelen id karşılaştırılır.
					var x = c.konum;
					tarifler[i].malzemeler.splice(x, 1);  // Silme işlemi bu satırda yapılır.

				
				
				}
			}
			d = JSON.stringify(tarifler); // Güncel tarifler dizisi string tipinde d değişkenine aktarılır.
			fs.writeFile("db/database.json",d, function (ex) 
			{	// Güncel tarifler listesi dosyaya yazdırılır.
				if (ex) 
				{	// Hata varsa bu blok çalışır
					console.log("Silme işlemi başarısız.");
					res.status(400).send("Silme islemi basarisiz.");
				}else
				{	// Hata yoksa bu blok çalıştırılır.
					res.end("Silme islemi basarili."); 	// Sunucuya gönderilen veri
					console.log("Silme işlemi başarılı.");
				}
			});				
		}
	});
});

app.get("/tarif-ara",function(req,res)
{	// Tarif arama işlemlerini gerçekleştiren metot
	var c = req.query;
	console.log(c)
	if(c.isim == undefined){ // Aranan tarifin isminin tanımlı olması gerekir. Aksi halde hata mesajı döndürür.
		res.status(400).send("Isim bilgisi girilmelidir.");
		return;
	}
	
	fs.readFile("db/database.json", "utf8", function (ex, data) 
	{		
		if (ex) 
		{
			console.log("Dosya okumada hata oluştu!");
			res.status(500).send("Dosya okumada hata oluştu!");
		} else 
		{
				var tarifler = [];
				var d;
				d = JSON.parse(data);
				if(d!=null) 
				{	// Dosyada tarif ekli olduğundan emin olunur.
					var sonuclar = [];
					tarifler = d;
					for(var i = 0;i<tarifler.length;i++){
						var k = tarifler[i].isim; // Tüm tarif isimleri bu değişkene aktarılır.
						var l = k.search(c.isim); // Web sayfasından gelen isim tüm tarif isimleri ile karşılaştırılır.

						if(l == 0){ // Sonuç sıfır ise eşleşme var demektir.
							sonuclar.push(tarifler[i]); // Eşleşen tüm tarler listeye eklenir.
							console.log(sonuclar)
						}
					}
					if(sonuclar.length == 0) {	// Dizinin boyutu sıfır ise bu aradığımız tarifin listesinde olmadığını gösterir.
						res.status(400).send("Eslesme yok");
					} else { // Ancak dizi boyutu sıfırdan büyükse o halde dizide elaman var demektir.
						res.json(sonuclar); // Dizi Json formatına çevrilerek cevap olarak gönderilir.
					}
					
				}						
		}
	});
});

app.post("/tarif-guncelle",function(req,res)
{
	var c = req.body; // Sunucuya gönderilen istediğin parametreleri c değişkenine aktarılır.
	
	// Parametrelerin içinde tüm tarif bilgilerinin varlığı kontrol edilir. Yoksa 400 numaralı sunucu hatası döndürür.
	// Tüm veriler mevcutsa program akışı devam eder.
	if(c.id == undefined){
		res.status(400).send("Id bilgisi girilmelidir.");
		return;
	}
	else if(c.isim == undefined){
		res.status(400).send("Isim bilgisi girilmelidir.");
		return;
	}
	else if(c.malzemeler == undefined){
		res.status(400).send("Malzemeler bilgisi girilmelidir.");
		return
	}
	else if(c.talimatlar == undefined){
		res.status(400).send("Talimatlar bilgisi girilmelidir.");
		return
	}
	else if(c.kategori == undefined){
		res.status(400).send("Kategori bilgisi girilmelidir.");
		return
	}
	else if(c.puan == undefined){
		res.status(400).send("Puan bilgisi girilmelidir.");
		return
	}
	
	fs.readFile("db/database.json", "utf8", function (ex, data) 
	{	// Dosya okunur ve sonuc data değişkeninde saklanır.	
		if (ex) 
		{
			console.log("Dosya okumada hata oluştu!"); // Hata olduğunda consol da hata mesajı bastırır.
			res.status(500).send("Dosya okumada hata oluştu!"); // Hata olduğunda consol da hata mesajı bastırır.
		} else 
		{
				var tarifler = [];
				var d;
				d = JSON.parse(data); // Dosyada ki tüm veriler d değişkeninde saklanır
				tarifler = d; // Tüm tarifler diziye aktarılır.
				for(var i = 0;i<tarifler.length;i++){ // Bu blokta tüm kişi id değerleri telefondan gelen id değeri
				// ile karşılaştırılarak detaylarında güncelleme yapmak istediğimiz kişiye ulaşmaya çalışıyoruz.
				
					var k = tarifler[i].id; // Tüm tariflerin id değeri
					var l = c.id; // Web sayfasından gelen id
					if(k == l){ // Eşleşme olduğunda o tarifin verileri web sayfasından gelen güncel veri ile değiştirilir.
						tarifler[i].id = c.id
						tarifler[i].isim = c.isim
						tarifler[i].malzemeler = c.malzemeler
						tarifler[i].talimatlar = c.talimatlar
						tarifler[i].kategori = c.kategori
						tarifler[i].puan = c.puan
					}
				}
			
				d = JSON.stringify(tarifler); // Dizimiz string tipine çevrilerek d değişkeninde saklanır.
				fs.writeFile("db/database.json",d, function (ex) 
				{	// Güncel olan tarif verileri d değişkeni ile dosyaya yazılır.
					if (ex) 
					{
						console.log("Güncelleme işlemi başarısız!");
						res.status(400).send("Guncelleme islemi basarisiz!");
					}else
					{
						res.end("Tarif guncellendi.");
						console.log("Tarif güncellendi.");
					}
				});				
		}
	});
});

app.listen(8080);	// Uygulamam sürekli bu portu dinleyerek gelen isteklere cevap verir.