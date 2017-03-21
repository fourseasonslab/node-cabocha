var Cabocha = require("node-cabocha");
cabocha = new Cabocha();
cabocha.parse("すもももももももものうち", function(result){
	console.log(result);
});
