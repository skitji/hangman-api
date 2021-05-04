const express = require('express');
const app = express();
const fs = require('fs');

const port = 1000;

let dictonary = new Array();
let letters = new Array();

var readStream = fs.createReadStream('deutsch.txt', 'utf8');
readStream.on('data', (line) => {
    line.split("\r\n").map(x => x.toLowerCase()).forEach(word => {
        dictonary.push(word);
    });
}).on('end', () => {
    dictonary.reduce((a, b) => a + b).split('').forEach(x => {
        if(!letters.includes(x)) {
            letters.push(x);
        }
    })
    console.log(letters);
    console.log('Reading is finished');
});

app.get('/', (req, res) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.writeHead(200, {'Content-Type': 'application/json'});
    let word = req.query.word;
    let excludedLetters = new Array();
    if(word == undefined) {
        res.write(JSON.stringify({
            error: "No word defined"
        }))
        res.end();
        return;
    }
    let newDic = dictonary
                        .filter((x) => word.length ==  x.length)
                        .filter((x) => {
                            for(let i = 0; i < x.length; i++) {
                                if(word.charAt(i) != '_' && word.charAt(i) != x.charAt(i)) {
                                    return false;
                                }
                            }
                            return true;
                        });
    if(req.query.excludedletters != undefined) {
        excludedLetters = req.query.excludedletters.split('');
        newDic = newDic.filter((x) => {
            result = true;
            excludedLetters.forEach((letter) => {
                if(x.includes(letter)) {
                    result = false;
                }
                
            })
            return result;
        })
    }
	
    let possibleLetters = [];
	let number = 0;
	let letter;
	if(newDic.length > 0) {
		possibleLetters = letters.filter(x => {
                                return !excludedLetters.includes(x) && !word.includes(x) && newDic.reduce((a, b) => a + b).includes(x);
                            });

		
		possibleLetters.forEach(l => {
			let n = newDic
						.reduce((a, b) => a+b)
						.split('')
						.filter(x => x == l)
						.length;
			if(n > number) {
				letter = l;
				number = n;
			}
			
		})
	}

    res.write(JSON.stringify({
        words: newDic,
        number: newDic.length,
        mostLetter: letter,
        possibleLetters

    }));
    res.end();
    
});

app.listen(port, () => {
})