/**
 * Created by john on 16/3/31.
 */
var mongoose = require('mongoose');
var MovieSchema = new mongoose.Schema({
   type:String,
    movies:[{img:String,title:String,time:String,link:String}]
});

/*MovieSchema.pre('save',function(next){
    next();
});*/
var Movie = mongoose.model('Movie',MovieSchema);

module.exports = Movie ;