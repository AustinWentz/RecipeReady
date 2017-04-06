var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Instances = new Schema({
  expiration_date:  Date,
  purchased_date: Date,
  amount: Number,
  unit:   String
});

var User_Ingredient = new Schema({
  name:  String,
  instances: [Instances]
});

var Diet_Ingredient = new Schema({
  name: String
});

var Shop_Ingredient = new Schema({
  name: String
});

var Recipe_Ingredient = new Schema({
  name:  String,
  amount: Number,
  unit:   String
});

var Recipe = new Schema({
  name:  String,
  thumbnail: String,
  link:   String,
  ingredients: [Recipe_Ingredient]
});

var userSchema = new Schema({
	username: String,
	password: String, //hash created from password
  //email: String //stores email as a plain text string
	created_at: {type: Date, default: Date.now},

	pantry: [User_Ingredient],
  shopping_list: [Recipe_Ingredient],
  recipe_favorites: [Recipe],
 	dietary: [Recipe_Ingredient]
});


mongoose.model('Recipe_Ingredient', Recipe_Ingredient);
mongoose.model('Recipe', Recipe);
mongoose.model('Instances', Instances);
mongoose.model('User_Ingredient', User_Ingredient);
mongoose.model('Diet_Ingredient', Diet_Ingredient);
mongoose.model('Shop_Ingredient', Shop_Ingredient);
mongoose.model('User', userSchema);
