
lychee.define('lychee.ai.neural.Agent').requires([
	'lychee.ai.neural.Evolution',
	'lychee.ai.neural.Genome',
	'lychee.ai.neural.Network'
]).exports(function(lychee, global, attachments) {

	const _Evolution  = lychee.import('lychee.ai.neural.Evolution');
	const _Genome     = lychee.import('lychee.ai.neural.Genome');
	const _Network    = lychee.import('lychee.ai.neural.Network');
	const _INSTANCES  = {};
	const _EVOLUTIONS = {};



	/*
	 * HELPERS
	 */

	const _connect = function() {

		let id = this.id;


		let instances = _INSTANCES[id] || null;
		if (instances === null) {

			instances = _INSTANCES[id] = [ this ];

		} else {

			if (instances.indexOf(this) === -1) {
				instances.push(this);
			}

		}


		let evolution = _EVOLUTIONS[id] || null;
		if (evolution === null) {

			let network = this.__network;
			let weights = 0;

			if (network !== null) {
				weights = network.countWeights();
			}


			evolution = _evolutions[id] = new _Evolution({
				population: instances.length,
				weights:    weights
			});

			this.__evolution = evolution;

		} else {

			if (evolution.population !== instances.length) {
				evolution.setPopulation(instances.length);
			}

			this.__evolution = evolution;

		}

	};

	const _disconnect = function() {

		let id = this.id;


		let instances = _INSTANCES[id] || null;
		if (instances !== null) {

			let index = instances.indexOf(this);
			if (index !== -1) {
				instances.splice(index, 1);
			}

		}


		let evolution = this.__evolution;
		if (evolution !== null) {
			this.__evolution = null;
		}

	};



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = Object.assign({}, data);


		this.id = 'lychee-ai-neural-Agent-' + _id++;

		this.__evolution = null;
		this.__genome    = new _Genome({
			weights: this.__network.countWeights()
		});
		this.__network   = new _Network({
			inputs:  4,
			outputs: 2,
			layers:  2,
			neurons: 6
		});


		this.setId(settings.id);


		_connect.call(this);

/*
 * TODO: This might be some crap shit, so evaluate this
 * this.network.putWeights(this.__evolution.population[_INSTANCES[this.id].indexOf(this)].weights);
 */

	};


	Composite.prototype = {

		reward: function() {
			// TODO: Reward method
		},

		punish: function() {
			// TODO: Punish method
		},

		setId: function(id) {

			id = typeof id === 'string' ? id : null;


			if (id !== null) {

				_disconnect.call(this);
				this.id = id;
				_connect.call(this);

				return true;

			}


			return false;

		}

	};


	return Composite;

});

