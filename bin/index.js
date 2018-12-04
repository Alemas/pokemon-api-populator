#! /usr/bin/env node
var request = require('request');
var fs = require('fs');
const cliProgress = require('cli-progress');
const colors = require('colors');

var arguments = process.argv.splice(2, process.argv.length -1).join(' ')
console.log(arguments);

// fs.readFile("./data/first_generation.json", function(err, data) {
// 	if (err) {console.log(err); return;}
// 	let pokemons = JSON.parse(data);
// 	for (var i = 2; i <= 151; i++) {
// 		if (pokemons[i] == null) { continue }
// 		let newPokemon = {
// 			name: pokemons[i].name,
// 			type: pokemons[i].type,
// 			secondaryType:null
// 		}

// 		console.log(newPokemon);

// 		request({method: 'post', url: "http://10.96.127.59:2001/api/pokemon", json: newPokemon}, function(err, res, body) {
// 			console.log(err+'\n'+body);
// 			if (res) {console.log(JSON.stringify(res)+'\n')} else {console.log('\n')}
// 		});

// 	}
// })

let baseURL = "http://10.96.127.59:2001/api/pokemon/";

capitalize = (value) => {
	return value.replace(/^\w/, c => c.toUpperCase());
}

downloadPokemons = (callback) => {

	console.log('Downloading data...\n')

	let downloaded = 0;
	let first_generation = [];
	let barFormat =  colors.green('{bar}') + ' {percentage}%';

	let bar = new cliProgress.Bar({format: barFormat}, cliProgress.Presets.shades_classic);
	bar.stopOnComplete = true;
	bar.start(150, 0);

	for (var i = 1; i <= 151; i++) {
		request({method: 'get', url: "https://pokeapi.co/api/v2/pokemon/"+i}, function(err, res, body) {
			if (err) {
				console.log('\nERROR DOWNLOADING: ' + err);
				process.exit(-1);
			}

			let pokemon = JSON.parse(body);
			let newPokemon = {};
			newPokemon.pokedexId = pokemon.id;
			newPokemon.name = capitalize(pokemon.name);
			newPokemon.secondaryType = null;

			let newFormat = barFormat + ' - Downloaded ' + newPokemon.name;
			bar.increment();
			bar.format = newFormat;

			for (let i in pokemon.types) {
				if (i == 0){ newPokemon.type = capitalize(pokemon.types[i].type.name); }
				if (i == 1){ newPokemon.secondaryType = capitalize(pokemon.types[i].type.name); }
			}

			first_generation = first_generation.concat(newPokemon);
			downloaded++;

			if (downloaded == 150) {
				first_generation = first_generation.sort((a, b) => {if(a.pokedexId > b.pokedexId){return 1;} return -1;})
				console.log('\nSaving to file...')

				fs.writeFile('./data/first_generation.json', JSON.stringify(first_generation), function(err) {

					if (err) {

						console.log('ERROR SAVING FILE: '+err);
						process.exit(-1);

					}
					console.log('Done.');

					if (callback) {
						callback();
					} else {
						process.exit(-1);						
					}
				})
			}
		});
	}
}

uploadPokemons = () => {
	console.log("\nReading file...");

	fs.readFile("./data/first_generation.json", (err, data) => {

		if (err) {

			console.log("ERRO READING FILE: "+err);
			process.exit(-1);

		} else {

			console.log('Done.');
			let pokemons = JSON.parse(data);
			console.log("Uploading data...\n");

			let downloaded = 0;
			let barFormat =  colors.green('{bar}') + ' {percentage}%';
			let bar = new cliProgress.Bar({format: barFormat}, cliProgress.Presets.shades_classic);
			bar.stopOnComplete = true;
			bar.start(150, 0);

			for (let index in pokemons) {

				let pokemon = pokemons[index];

				request({method: 'post', url: baseURL, json: pokemon}, function(err, res, body) {

					if (err) {

						console.log('\nERROR UPLOADING: '+err);
						process.exit(-1);

					}

					let newFormat = barFormat + ' - Uploaded ' + pokemon.name;
					bar.increment();
					bar.format = newFormat;

					downloaded++;

					if(downloaded == 150) {
						process.exit(-1);
					}
				});
			}
		}
	})
}

fs.access("./data/first_generation.json", fs.constants.F_OK, (err) => {
	if (err) {
		console.log("File doesn't exist.");
		downloadPokemons(uploadPokemons);
	} else {
		uploadPokemons();
	}
})

// let bar = new cliProgress.Bar({format: colors.green(' {bar}') + ' {percentage}% - Uploading pokémons'}, cliProgress.Presets.shades_classic);
// bar.stopOnComplete = true;
// bar.start(300, 0);

// for (var i = 2; i <= 151; i++) {
// 	let pokedexId = i;
// 	request({method: 'get', url: "https://pokeapi.co/api/v2/pokemon/"+i}, function(err, res, body) {
// 		bar.increment();
// 		if (err) {
// 			console.log(err);
// 		} else {
// 			let pokemon = JSON.parse(body);
// 			var newPokemon = {};
// 			newPokemon.pokedexId = pokedexId;
// 			newPokemon.name = capitalize(pokemon.name);
// 			newPokemon.secondaryType = null;

// 			for (let i in pokemon.types) {
// 				if (i == 0){ newPokemon.type = capitalize(pokemon.types[i].type.name); }
// 				if (i == 1){  newPokemon.secondaryType = capitalize(pokemon.types[i].type.name); }
// 			}

// 			request({method: 'post', url: baseURL, json: newPokemon}, function(err, res, body) {
// 				bar.increment();
// 				if (err) {console.log(err);}
// 			});
// 		}
// 	});
// }

