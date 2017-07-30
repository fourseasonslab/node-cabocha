class Cabocha
{
	p: any;  
	f: Function;
	constructor(dictPath?: string){
		var childprocess = require("child_process");
		this.p = childprocess.spawn('cabocha', ["-f1"].concat(dictPath == undefined ? [] : ["-d", dictPath]), {});
		var that = this;
		this.p.stdout.on('data', function(data){
			//console.log('stdout: ' + data);
			//console.log(that);
			if(that.f instanceof Function){
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
				//console.log(res);

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
				that.f(ret);
			}
		});
		this.p.on('exit', function (code) {
			console.log('child process exited.');
		});
		this.p.on('error', function (err) {
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
	}

	parse(s: string, f: Function){
		this.f = f;
		this.p.stdin.write(s + "\n");
	}

}


module.exports = Cabocha;

