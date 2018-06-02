const child_process = require("child_process");

class Cabocha
{
	isDebugMode: boolean = false;
	dictPath: string;
	constructor(dictPath?: string){
		this.dictPath = dictPath;
		if(!this.isCabochaInstalled()) return;
	}
	enableDebugMode(){
		this.isDebugMode = true;
	}
	debugLog(text: string){
		if(!this.isDebugMode) return;
		console.log("node-cabocha debug: " + text);
	}
	isCabochaInstalled(){
		try{
			const result = child_process.execSync('which cabocha');
			if(result.length > 0){
				return true;
			}
		} catch(e){
			console.error("node-cabocha: Warning: cabocha not found.");
		}
		return false;
	}
	parse(s: string, callback: Function){
		if(!this.isCabochaInstalled()) return;
		this.debugLog("parse requested.");
		var p = child_process.spawn('cabocha', ["-f1"].concat(this.dictPath == undefined ? [] : ["-d", this.dictPath]), {});
		p.stdout.on('data', (data) => {
			this.debugLog("data" + data);
			var parseCabochaResult = function (inp) {
				inp = inp.replace(/ /g, ",");
				inp = inp.replace(/\r/g, "");
				inp = inp.replace(/\s+$/, "");
				var lines = inp.split("\n");
				var res = lines.map(function(line) {
					return line.replace('\t', ',').split(',');
				});
				return res;
			};
			var res = parseCabochaResult("" + data);
			var depres = [];    //dependency relations
			var item = [0, "", []];	// [relID, "chunk", [[mecab results]]]o
			var mecabList = [];
			var mecabs = [];
			var scores = [];
			var score;
			for(var i = 0; i < res.length; i++){
				var row = res[i];
				if(i != 0 && (row[0] === "EOS" || row[0] === "*")){
					item[2] = mecabList;
					depres.push(item);
					item = [0, "", []];
					mecabList = [];
				}
				if(row[0] === "EOS") break;
				if(row[0] === "*"){
					item[0] = parseInt(
						row[2].substring(0, row[2].length - 1));
					score = row[4];
				} else{
					item[1] += row[0];
					mecabs.push(row);
					mecabList.push(mecabs.length - 1);
					var scr = Number(score);
					scores.push(scr);
				}
			}
			var ret = {
				depRels: depres,
				words: mecabs,
				scores: scores,
			};
			p.kill();
			callback(ret);
		});
		p.on('exit', (code) => {
			this.debugLog(`child process exited (code ${code}).`);
		});
		p.on('error', (err) => {
			console.error("Error detected in node-cabocha!");
			if(err && err.code === "ENOENT"){
				console.error(err.path + " not found!");
				if(err.path === "cabocha"){
					console.error("Please install cabocha from:");
					console.error("https://taku910.github.io/cabocha/");
				}
			} else{
				console.error(err);
			}
		});
		p.stdin.write(s + "\n");
	}
}

module.exports = Cabocha;

