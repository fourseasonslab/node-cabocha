var Cabocha = require("../");
const cabocha = new Cabocha();
//cabocha.enableDebugMode();
cabocha.parse("すもももももももものうち", (result) => {
	console.log(result);
	cabocha.parse("おいしいかぼちゃの季節になりましたね", (result) => {
		console.log(result);
		process.exit();
	});
});
