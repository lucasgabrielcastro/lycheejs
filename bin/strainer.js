#!/usr/local/bin/lycheejs-helper env:node


const _fs   = require('fs');
const _path = require('path');
const _ROOT = _path.resolve(__dirname, '../');


if (_fs.existsSync(_ROOT + '/libraries/lychee/build/node/core.js') === false) {
	require(_ROOT + '/bin/configure.js');
}


const lychee = require(_ROOT + '/libraries/lychee/build/node/core.js')(_ROOT);



/*
 * USAGE
 */

const _print_help = function() {

	let libraries = _fs.readdirSync(_ROOT + '/libraries').sort().filter(function(value) {
		return _fs.existsSync(_ROOT + '/libraries/' + value + '/lychee.pkg');
	}).map(function(value) {
		return '/libraries/' + value;
	});

	let projects = _fs.readdirSync(_ROOT + '/projects').sort().filter(function(value) {
		return _fs.existsSync(_ROOT + '/projects/' + value + '/lychee.pkg');
	}).map(function(value) {
		return '/projects/' + value;
	});


	console.log('                                                    ');
	console.info('lychee.js ' + lychee.VERSION + ' Strainer');
	console.log('                                                    ');
	console.log('Usage: lycheejs-strainer [Action] [Library/Project] ');
	console.log('                                                    ');
	console.log('                                                    ');
	console.log('Available Actions:                                  ');
	console.log('                                                    ');
	console.log('    stash                                           ');
	console.log('                                                    ');
	console.log('Available Libraries:                                ');
	console.log('                                                    ');
	libraries.forEach(function(library) {
		let diff = ('                                                ').substr(library.length);
		console.log('    ' + library + diff);
	});
	console.log('                                                    ');
	console.log('Available Projects:                                 ');
	console.log('                                                    ');
	projects.forEach(function(project) {
		let diff = ('                                                ').substr(project.length);
		console.log('    ' + project + diff);
	});
	console.log('                                                    ');
	console.log('Examples:                                           ');
	console.log('                                                    ');
	console.log('    lycheejs-strainer stash /libraries/lychee;      ');
	console.log('    lycheejs-strainer stash /projects/boilerplate;  ');
	console.log('                                                    ');

};

const _bootup = function(settings) {

	console.info('BOOTUP (' + process.pid + ')');

	let environment = new lychee.Environment({
		id:       'strainer',
		debug:    false,
		sandbox:  true,
		build:    'strainer.Main',
		timeout:  3000,
		packages: [
			new lychee.Package('lychee',     '/libraries/lychee/lychee.pkg'),
			new lychee.Package('fertilizer', '/libraries/fertilizer/lychee.pkg'),
			new lychee.Package('strainer',   '/libraries/strainer/lychee.pkg')
		],
		tags:     {
			platform: [ 'node' ]
		}
	});


	lychee.setEnvironment(environment);


	environment.init(function(sandbox) {

		if (sandbox !== null) {

			let lychee   = sandbox.lychee;
			let strainer = sandbox.strainer;


			// Show less debug messages
			lychee.debug = true;


			// This allows using #MAIN in JSON files
			sandbox.MAIN = new strainer.Main(settings);

			sandbox.MAIN.bind('destroy', function(code) {
				process.exit(code);
			});

			sandbox.MAIN.init();


			process.on('SIGHUP',  function() { sandbox.MAIN.destroy(); this.exit(1); });
			process.on('SIGINT',  function() { sandbox.MAIN.destroy(); this.exit(1); });
			process.on('SIGQUIT', function() { sandbox.MAIN.destroy(); this.exit(1); });
			process.on('SIGABRT', function() { sandbox.MAIN.destroy(); this.exit(1); });
			process.on('SIGTERM', function() { sandbox.MAIN.destroy(); this.exit(1); });
			process.on('error',   function() { sandbox.MAIN.destroy(); this.exit(1); });
			process.on('exit',    function() {});


			new lychee.Input({
				key:         true,
				keymodifier: true
			}).bind('escape', function() {

				console.warn('strainer: [ESC] pressed, exiting ...');
				sandbox.MAIN.destroy();

			}, this);

		} else {

			console.error('BOOTUP FAILURE');

			process.exit(1);

		}

	});

};



const _SETTINGS = (function() {

	let args     = process.argv.slice(2).filter(val => val !== '');
	let settings = {
		action:  null,
		project: null
	};


	let action  = args.find(val => /^(stash)/g.test(val));
	let project = args.find(val => /^\/(libraries|projects)\/([A-Za-z0-9-_\/]+)$/g.test(val));


	if (action === 'stash') {

		if (project !== undefined) {

			settings.action = action;


			try {

				let stat1 = _fs.lstatSync(_ROOT + project);
				let stat2 = _fs.lstatSync(_ROOT + project + '/lychee.pkg');
				if (stat1.isDirectory() && stat2.isFile()) {
					settings.project = project;
				}

			} catch(e) {

				settings.project = null;

			}

		}

	}


	return settings;

})();



(function(action, project) {

	/*
	 * IMPLEMENTATION
	 */

	let has_action  = action !== null;
	let has_project = project !== null;


	if (has_action && has_project) {

		_bootup({
			action:  action,
			project: project
		});

	} else {

		console.error('PARAMETERS FAILURE');

		_print_help();

		process.exit(1);

	}

})(_settings.action, _settings.project);

