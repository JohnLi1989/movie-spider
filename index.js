var cheerio = require('cheerio');
var http = require('http');
var Promise = require('bluebird');
var superagent = require('superagent');
var mongoose = require('mongoose');
var charset = require('superagent-charset');
charset(superagent);
var Movies = require('./movies');
var baseUrl = "http://www.6vhao.net/dy1/";
mongoose.connect('mongodb://localhost/pachong');
mongoose.connection.on('open',function(){
   console.log('mongodb is open');
});
function filterMovies(html){
    var $ = cheerio.load(html);
    var type = $('div.channellist').find('a').eq(1).text();
    var moviesList = {
        type: type,
        movies: []
    }
    $('div.listBox > ul > li').each(function(i,e){
        var img = $(e).find('img').attr('src');
        var title =  $(e).find('p').eq(0).text();
        var time =  $(e).find('p').eq(2).text();
        var link = $(e).find('a').attr('href');
        var singleMovie = {
            img:img,
            title:title,
            time:time,
            link:link
        }
        moviesList.movies.push(singleMovie);
    });
    var movie = new Movies(moviesList);
    movie.save(function(err){
        if(err){
            console.log('保存失败');
        }else{
            console.log('已存入数据库');
        }
    });
}
function getAllPage(url){
    return new Promise(function(resolve,reject){
        console.log('正在爬取' + url);
        superagent.get(url)
            .charset('gbk')
            .end(function(err,res){
                if(err){
                    reject(err);
                    console.log("出错!");
                }
                var html = res.text;
                resolve(html);
                filterMovies(html);

            });
    });
}

var getPagesFuncArr = [];
for(var i=2;i<140;i++){
    getPagesFuncArr.push(getAllPage(baseUrl+'index_'+i+'.html'));
}
Promise
    .all(getPagesFuncArr)
    .then(function(pages){
        var allMovieArr = [];
        pages.forEach(function(html){
            var allMovie = filterMovies(html);
            allMovieArr.push(allMovie);
        });

    });