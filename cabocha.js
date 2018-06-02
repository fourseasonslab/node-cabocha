var child_process = require("child_process");
var Cabocha = /** @class */ (function () {
    function Cabocha(dictPath) {
        this.isDebugMode = false;
        this.dictPath = dictPath;
        if (!this.isCabochaInstalled())
            return;
    }
    Cabocha.prototype.enableDebugMode = function () {
        this.isDebugMode = true;
    };
    Cabocha.prototype.debugLog = function (text) {
        if (!this.isDebugMode)
            return;
        console.log("node-cabocha debug: " + text);
    };
    Cabocha.prototype.isCabochaInstalled = function () {
        try {
            var result = child_process.execSync('which cabocha');
            if (result.length > 0) {
                return true;
            }
        }
        catch (e) {
            console.error("node-cabocha: Warning: cabocha not found.");
        }
        return false;
    };
    Cabocha.prototype.parse = function (s, callback) {
        var _this = this;
        if (!this.isCabochaInstalled())
            return;
        this.debugLog("parse requested.");
        var p = child_process.spawn('cabocha', ["-f1"].concat(this.dictPath == undefined ? [] : ["-d", this.dictPath]), {});
        p.stdout.on('data', function (data) {
            _this.debugLog("data" + data);
            var parseCabochaResult = function (inp) {
                inp = inp.replace(/ /g, ",");
                inp = inp.replace(/\r/g, "");
                inp = inp.replace(/\s+$/, "");
                var lines = inp.split("\n");
                var res = lines.map(function (line) {
                    return line.replace('\t', ',').split(',');
                });
                return res;
            };
            var res = parseCabochaResult("" + data);
            var depres = []; //dependency relations
            var item = [0, "", []]; // [relID, "chunk", [[mecab results]]]o
            var mecabList = [];
            var mecabs = [];
            var scores = [];
            var score;
            for (var i = 0; i < res.length; i++) {
                var row = res[i];
                if (i != 0 && (row[0] === "EOS" || row[0] === "*")) {
                    item[2] = mecabList;
                    depres.push(item);
                    item = [0, "", []];
                    mecabList = [];
                }
                if (row[0] === "EOS")
                    break;
                if (row[0] === "*") {
                    item[0] = parseInt(row[2].substring(0, row[2].length - 1));
                    score = row[4];
                }
                else {
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
                scores: scores
            };
            p.kill();
            callback(ret);
        });
        p.on('exit', function (code) {
            _this.debugLog("child process exited (code " + code + ").");
        });
        p.on('error', function (err) {
            console.error("Error detected in node-cabocha!");
            if (err && err.code === "ENOENT") {
                console.error(err.path + " not found!");
                if (err.path === "cabocha") {
                    console.error("Please install cabocha from:");
                    console.error("https://taku910.github.io/cabocha/");
                }
            }
            else {
                console.error(err);
            }
        });
        p.stdin.write(s + "\n");
    };
    return Cabocha;
}());
module.exports = Cabocha;
