cabocha.js : cabocha.ts Makefile
	tsc cabocha.ts

test: cabocha.js Makefile
	node example/index.js
