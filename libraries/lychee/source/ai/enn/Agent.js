
lychee.define('lychee.ai.enn.Agent').includes([
	'lychee.ai.Agent'
]).requires([
	'lychee.ai.enn.Brain'
]).exports(function(lychee, global, attachments) {

	const _Agent = lychee.import('lychee.ai.Agent');
	const _Brain = lychee.import('lychee.ai.enn.Brain');



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = Object.assign({}, data);


		settings.brain = new _Brain();


		_Agent.call(this, settings);

		settings = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Agent.prototype.serialize.call(this);
			data['constructor'] = 'lychee.ai.enn.Agent';


			return data;

		},



		/*
		 * CUSTOM API
		 */

		crossover: function(agent) {

			// TODO: crossover() genome of brainz

		},

		mutate: function() {

			// TODO: mutate() genome of brainz

		}


	};


	return Composite;

});

