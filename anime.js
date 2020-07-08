var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var fuse = require('fuse.js');
var web_anime="https://anoboy.stream/";
var web_scrap="https://gokunime.com/";


// Config
var port = process.env.PORT | 8888;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
var source = 'http://animeindo.web.id';

// Route
app.get('/', greeting);
app.get('/anime/streaming', streaming);
app.get('/anime/latest_update', latest_update);
app.get("/anime/recommended",recommended);
app.get("/anime/detail",detail);
app.get("/anime/genre",genre);
app.get("/anime/genre_list",genre_list);
app.get("/anime/search",search);




// Behavior
/**
 * Replace all string
 * @param  {String} search
 * @param  {String} replacement
 * @return {String}
 */
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

function search(req,res){
	if(req.query.s!=null){
		request(web_scrap+"?s="+req.query.s+"&post_type=anime",(error,response,html)=>{
			if(!error){
				var data=[];
				var $ = cheerio.load(html);
				$(".arsipnime").find("li").each((i,el)=>{
					var alamat_gambar=$(el).find("img").attr("src");
					var url=$(el).find("a").attr("href");
					var judul_anime=$(el).find("a").attr("title");
					var sinopsis=$(el).find(".sns").text();
					var jumlah_episode=$(el).find(".bt").children(".r").text();
			        var type=$(el).find(".bt").children(".l").text();

					data.push({
						alamat_gambar : alamat_gambar,
						url:url,
						judul_anime:judul_anime,
						sinopsis:sinopsis,
						type:type,
						jumlah_episode:jumlah_episode
					});
				})

			    res.status(200).json({
					status: "1",
					message: 'Feel free stream anime API',
					data : data,
					total:data.length
				});
				
			}else{
				res.status(500).json({
					status: "0",
					error:error.message,
					message: 'Something wrong with search anime API ',
			   });
			}
		});
	}else{
		res.status(400).json({
			status: "0",
			message: 'you must add param before access this api',
	   });
	}
}


function genre_list(req,res){
	if(req.query.url!=null){
		var page="";
		if(req.query.page!=null){
		 page="page/"+req.query.page;
		}
		request(req.query.url+page,(error,response,html)=>{
			if(!error){
				var data=[];
				var $ = cheerio.load(html);
				$(".arsipnime").find("li").each((i,el)=>{
					var alamat_gambar=$(el).find("img").attr("src");
					var url=$(el).find("a").attr("href");
					var judul_anime=$(el).find("a").attr("title");
					var sinopsis=$(el).find(".sns").text();
					var rating=$(el).find(".bt").children(".r").text();
					var type=$(el).find(".bt").children(".l").text();
					data.push({
						alamat_gambar : alamat_gambar,
						url:url,
						judul_anime:judul_anime,
						sinopsis:sinopsis,
						rating:rating,
						type:type
					});
				})

			    res.status(200).json({
					status: "1",
					message: 'Feel free stream anime API',
					data : data,
					total:data.length
				});
				
			}else{
				res.status(500).json({
					status: "0",
					error:error.message,
					message: 'Something wrong with genre anime API ',
			   });
			}
		});
	}else{
		res.status(400).json({
			status: "0",
			message: 'you must add param before access this api',
	   });
	}
}

function genre(req,res){
	request(web_scrap,(error,response,html)=>{
		if(!error){
			var genre=[];
			var $ = cheerio.load(html);
			$(".genrelist").find("li").each((i,el)=>{
				var url=$(el).find("a").attr("href");
				var text=$(el).find("a").text();
				genre.push({
					url:url,
					judul:text
				});
				
			});

			res.status(200).json({
				status: "1",
				message: 'Feel free to use anime API ',
				data:genre
		   });
		}else{
			res.status(500).json({
				status: "0",
				message: 'Something wrong with detail anime API ',
		   });
		}
	})
}

function detail(req,res){
	if(req.query.url!=null){
		request(req.query.url,(error,response,html)=>{
			if(!error){
				var $ = cheerio.load(html);
				var image_url=$(".bci").find("img").attr("src")
				var judul_anime=$(".ttl").find("h1").text();
				var rating=$(".sscore").text();
				var sinopsis=$(".sinopsis").find("p").text();
				var type=$(".bc").find(".typ").text();
				var season=$(".bc").find(".ssn").text();
				var genre=[];
				var episode=[];
				$(".gen").children("a").each((i,el)=>{
					genre.push($(el).text());
				});
				$(".skrol").children(".episode").find("tr").each((i,el)=>{
					//console.log($(el).find("a").attr("href"))
					episode.push({
						"url":$(el).find("a").attr("href"),
						"episode":$(el).find(".episode-kolom").children("a").text()
					})
				})

                var rekomendasi=[];
				$(".item").each((i,el)=>{
					var url=$(el).find('a').attr("href");
					var judul_anime=$(el).find(".info").find("a").attr("title");
					var rating="";
					rating=$(el).find(".itpeleft").text();
					var type=$(el).find(".itpe").text();	 
					var alamat_gambar=$(el).find("img").attr("src");
					rekomendasi.push({
						"alamat_gambar":alamat_gambar,
						"url":url,
						"judul_anime":judul_anime,
						"rating":rating,
						"type":type
					});
				})

				res.status(200).json({
					status: "1",
					message: 'Feel free to use anime API ',
					data:{
					  alamat_gambar:image_url,
					  judul_anime:judul_anime,
					  genre:genre,
					  sinopsis:sinopsis,
					  episode:episode,
					  rating:rating,
					  type:type,
					  season:season,
					  rekomendasi:rekomendasi
					}
			   });
				
			}else{
				res.status(500).json({
					status: "0",
					message: 'Something wrong with detail anime API ',
			   });
			}

	   });
	}else{
		res.status(400).json({
			status: "0",
			message: 'you must add param before access this api',
	   });
	}
}


function recommended(req,res){
	var data=[];
	request(web_scrap, function(error, response, html) {
		if(!error){
		   var $ = cheerio.load(html);
		   $(".item").each((i,el)=>{
			   var url=$(el).find('a').attr("href");
			   var judul_anime=$(el).find(".info").find("a").attr("title");
			   var rating="";
			   rating=$(el).find(".itpeleft").text();
			   var type=$(el).find(".itpe").text();

			   console.log(rating);
			   var alamat_gambar=$(el).find("img").attr("src");
			   data.push({
				   "alamat_gambar":alamat_gambar,
				   "url":url,
				   "judul_anime":judul_anime,
				   "rating":rating,
				   "type":type
			   });
            /// console.log("item "+judul_anime);
		   })

		   res.status(200).json({
			status: "1",
			message: 'Feel free stream anime API',
			data : data,
			total:data.length
		   });
		}else{
			res.status(500).json({
				status: "0",
				message: 'Sorry something wrong with recommended API',
				data : data
		   });
		}
	})

}

function streaming(req,res){
	if(req.query.url!=null){
		request(req.query.url,((error,response,html)=>{
			if(!error){
				var $ = cheerio.load(html);
				var url="";
				$('.player-embed').each((i,el)=>{
					$(el).each((x,element)=>{
						console.log($(element).html());
					});
					url=$(el).find("iframe").attr("src");
					var htmls=$(el).find("iframe").attr("src");
				
				})
				var episode=[];
				var judul_anime=$(".pagetitit").text();

				$('#epl').find("li").each((i,el)=>{
					var url=url=$(el).find("a").attr("href");
					var episode1=$(el).find("a").text()
					episode.push({
						url:url,
						episode:episode1
					});

				})
				res.status(200).json({
					status: "1",
					message: 'Streaming request success',
					data:{
						video_url:url,
						episode:episode,
						judul_anime:judul_anime
					}
			   });

			}else{
				res.status(500).json({
					status: "0",
					message: 'API streaming crashed',
			   });
			}
		}))

	}else{
		res.status(400).json({
			status: "0",
			message: 'you must add param before access this api',
	   });

	}
}


// Controller
function latest_update(req, res) {
	var data=[];
	var page="";
	if(req.query.page!=null){
		page="page/"+req.query.page;
	}
	console.log(web_scrap);

	request(web_scrap+page, function(error, response, html) {

		if(!error){
		   var $ = cheerio.load(html);
		   $(".grid3").each((i,el)=>{
			   var url=$(el).parent().attr("href")
			   var judul_anime=$(el).find('h4').text();
			   var alamat_gambar=$(el).find("img").attr("src");
			   var rating=$(el).find(".hoverother").find(".bgred").text();
			   var status=$(el).find(".hoverother").find(".bgblack").text();
			   var episode=$(el).find(".newepisodefloat.right.bgwhitetr").attr("title");
               console.log(episode);
			   data.push({
				   "judul_anime":judul_anime,
				   "alamat_gambar":alamat_gambar,
				   "url":url,
				   "rating":rating,
				   "status":status,
				   "episode":episode
			   });
            /// console.log("item "+judul_anime);
		   })

		   res.status(200).json({
			status: "1",
			message: 'Feel free stream anime API',
			data : data,
			total:data.length
		   });
		}else{
			res.status(500).json({
				status: "0",
				error : error,
				message: 'Sorry something wrong with latest update API',
				data : data
		   });
		}
	})
}

// Controller
function greeting(req, res) {
	var data=[];
	if(req.query.page!=null){
		web_anime=web_anime+"page/"+req.query.page;
	}

	request(web_anime, function(error, response, html) {
		if(!error){
		   var $ = cheerio.load(html);
		   $("")
		   $(".amv").each((i,el)=>{
			   var url=$(el).parent().attr("href")
			   var judul_anime=$(el).find('h3').text();
			   var tanggal=$(el).children(".jamup").text();
			   var alamat_gambar=$(el).find("amp-img").attr("src");
			   data.push({
				   "judul_anime":judul_anime,
				   "tanggal":tanggal,
				   "alamat_gambar":alamat_gambar,
				   "url":url
			   });
             console.log("item "+judul_anime);
		   })

		   res.status(200).json({
			status: "1",
			message: 'Feel free stream anime API',
			data : data
		   });
		}else{
			res.status(500).json({
				status: "0",
				message: 'Sorry something wrong with latest update API',
				data : data
		   });
		}
	})
}

/**
 * Get list anime
 * @param  {Object} req
 * @param  {Object} res
 * @return {Void}
 */
function listAnime(req, res) {
	var page = req.query.page || '0';
	var url = source + '/page/' + page;
	var host = req.get('host');
	var baseUrl = req.protocol + '://' + host + '/anime/';

	request(url, function(error, response, html) {
		if (!error) {
			var $ = cheerio.load(html);
			var datas = [];
			var title, thumbnail, uploaded, detail, image, url, episode;
			var data = $('#episodes').children('.episode');

			data.each(function(index, el) {
				detail = $(this).children('.episode-details');
				image = $(this).children('.episode-image').children('a');

				title = detail.children('h3').text().replace(' Subtitle Indonesia', '');
				uploaded = detail.children('div').children('.episode-meta').text();
				thumbnail = image.children('.primary').attr('src');
				url = image.attr('href');
				if (url) {
					var nameString = url.substr(0, url.indexOf('-subtitle-indonesia') - 3);
					var numberEp = 2;
					if (nameString.substr(nameString.length -1) === '-') {
						numberEp = 3;
					}
					episode = url.substr(url.indexOf('-subtitle-indonesia') - numberEp, numberEp);
					url = url.substr(0, url.indexOf('-subtitle-indonesia') - numberEp - 1);
				}

				datas.push({
					title: title ? title : 'No title',
					uploaded: uploaded ? uploaded : false,
					thumbnail: thumbnail ? thumbnail : 'default',
					url: url ? baseUrl + url.split('/')[5] + '/' + parseInt(episode): false
				});
			});
		    res.status(200).json(datas);
		} else {
		    res.status(403).json({status: false, message: 'Page error!'});
		}
	});
}

/**
 * View Anime detail
 * @param  {Object} req 
 * @param  {Object} res 
 * @return {Void}
 */
// function detailAnime(req, res) {
// 	var name = req.params.name;
// 	var ep = req.params.ep || '';
// 	var host = req.get('host');
// 	var baseUrl = req.protocol + '://' + host + '/anime/watch/';

// 	if (name) {
// 		var url = source + '/category/' + name;
// 		request(url, function(error, response, html) {
// 			if (!error) {
// 				var $ = cheerio.load(html);
// 				var title, stream, thumbnail, description, rating, summary;
// 				var episodes = [];
// 				var epList = $('.episode_list');
// 				title = $('.amin_week_box_up1').text();
// 				thumbnail = $('.cat_image').children().attr('src');
// 				description = $('.cat_box_desc').children('div').text();

// 				var indexRating = description.indexOf('Rating');
// 				indexRating = indexRating != -1 ? indexRating + 8 : description.indexOf('Skor') + 6;
// 				rating = 0.00;
// 				if (indexRating !== 5) {
// 					rating = description.substr(indexRating, 4);
// 					rating = (parseFloat(rating) / 2).toFixed(2);
// 					rating = parseFloat(rating);
// 				}

// 				var indexSummary = description.indexOf('Sinopsis');
// 				summary = '';
// 				if (indexSummary != -1) {
// 					summary = description.substr(indexSummary + 9, description.length - indexSummary);
// 				}

// 				epList.each(function(index, el) {
// 					var watch = baseUrl + $(this).children('a').attr('href').split('/')[5];
// 					watch = watch.replace('-subtitle-indonesia', '');
// 					episodes.push(watch);
// 					if (watch.indexOf(ep) !== -1) {
// 						stream = watch;
// 					}
// 				});

// 				res.status(200).json({
// 					title: title ? title : 'No title',
// 					thumbnail: thumbnail ? thumbnail : 'default',
// 					stram: stream,
// 					// description: description,
// 					rating: rating,
// 					summary: summary,
// 					episodes: episodes
// 				});
// 			} else {
// 			    res.status(403).json({status: false, message: 'Page error!'});
// 			}
// 		});
// 	} else {
// 	    res.status(500).json({status: false, message: 'Anime not found!'});
// 	}
// }

function watchAnime(req, res) {
	var name = req.params.name;

	if (name) {
		var url = source + '/' + name + '-subtitle-indonesia';
		request(url, function(error, response, html) {
			if (!error) {
				var $ = cheerio.load(html);
				var stream, streamStart, streamStop;
				var video = $('.player-area');

				stream = video.children().children().children().children('div').children('script').text();
				streamStart = stream.indexOf('http://www.blogger.com/video-play.mp4');
				streamStop = stream.indexOf('"image"') - streamStart;
				stream = stream.substr(streamStart, streamStop - 10);

				res.redirect(stream);
			} else {
  			    res.status(403).json({status: false, message: 'Page error!'});
  			}
		});
	}
}

/**
 * Search Anime
 * @param  {Object} req 
 * @param  {Object} res 
 * @return {Void}
 */
function searchAnime(req, res) {
	var search = req.body.filter || '';
	var url = source + '/anime-list-animeindo';
	var host = req.get('host');
	var baseUrl = req.protocol + '://' + host + '/anime/';

	if (search) {
		request(url, function(error, response, html) {
			if (!error) {
				var $ = cheerio.load(html);
				var anime = $('.amin_box_mid_link');
				var listAnime = [];

				anime.each(function(index, el) {
					var link = $(this).children();
					listAnime.push({
						title: link.text(),
						url: link.attr('href')
					});
				});

				var initSearch = new fuse(listAnime, { keys: ["title"] });
				var result = initSearch.search(search);

				res.status(200).json({
					result: result
				});
			} else {
			    res.status(403).json({status: false, message: 'Page error!'});
			}
		});
	} else {
	    res.status(403).json({status: false, message: 'No keyword!'});
	}
}

// Run
console.log('App Started');
app.listen(port);