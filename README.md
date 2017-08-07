# node-cabocha

[![npm version](https://badge.fury.io/js/node-cabocha.svg)](https://badge.fury.io/js/node-cabocha)

npm package for [Cabocha](https://taku910.github.io/cabocha/)

## Installation
you should install [Cabocha](https://taku910.github.io/cabocha/) before use node-cabocha
```bash
npm install node-cabocha
```

## Usage
```bash
var Cabocha = require("node-cabocha");
cabocha = new Cabocha();
cabocha.parse("すもももももももものうち", function(result){
    console.log(result);
});
```

## LICENCE
- MIT (for .ts and .js)
