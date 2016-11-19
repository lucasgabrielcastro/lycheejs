
lychee.define('lychee.ai.Layer').requires([
	'lychee.ai.Agent',
	'lychee.ai.enn.Agent',
//	'lychee.ai.neat.Agent',
//	'lychee.ai.hyperneat.Agent'
]).includes([
	'lychee.app.Layer'
]).exports(function(lychee, global, attachments) {

	const _Agent = lychee.import('lychee.ai.Agent');
	const _Layer = lychee.import('lychee.app.Layer');
	const _agent = {
		ENN:       lychee.import('lychee.ai.enn.Agent'),
		NEAT:      lychee.import('lychee.ai.neat.Agent'),
		HYPERNEAT: lychee.import('lychee.ai.hyperneat.Agent')
	};



	/*
	 * HELPERS
	 */

	const _get_agent_by_chromoroulette = function(population, threshold) {

		let fitness = 0;
		let agent   = null;

		for (let p = 0, pl = population.length; p < pl; p++) {

			let current = population[p];

			fitness += current.fitness;

			if (fitness > threshold) {
				agent = current;
				break;
			}

		}

		return agent;

	};

	const _initialize = function() {

		let controls   = this.controls;
		let entities   = this.entities;
		let sensors    = this.sensors;
		let population = this.__population;
		let that       = this;


		let Agent = _Agent;
		let type  = this.type;
		if (type === Composite.TYPE.ENN) {
			Agent = _agent.ENN;
		} else if (type === Composite.TYPE.NEAT) {
			Agent = _agent.NEAT;
		} else if (type === Composite.TYPE.HYPERNEAT) {
			Agent = _agent.HYPERNEAT;
		}


		for (let e = 0, el = entities.length; e < el; e++) {

			let entity = entities[e];
			let agent  = new Agent({
				entity:   entity,
				sensors:  sensors.map(function(sensor) {
					return lychee.deserialize(lychee.serialize(sensor));
				}),
				controls: controls.map(function(control) {
					return lychee.deserialize(lychee.serialize(control));
				})
			});

			population.push(agent);

		}

	};

	const _epoche = function() {

		let entities      = this.entities;
		let oldcontrols   = [];
		let oldsensors    = [];
		let oldpopulation = this.__population;
		let newpopulation = [];
		let fitness       = this.__fitness;


		oldpopulation.sort(function(a, b) {
			if (a.fitness > b.fitness) return -1;
			if (a.fitness < b.fitness) return  1;
			return 0;
		});


		fitness.total   =  0;
		fitness.average =  0;
		fitness.best    = -Infinity;
		fitness.worst   =  Infinity;

		for (let op = 0, opl = oldpopulation.length; op < opl; op++) {

			let agent = oldpopulation[op];

			oldsensors.push(agent.sensors);
			oldcontrols.push(agent.controls);

			// XXX: Avoid updates of Brain
			agent.sensors  = [];
			agent.controls = [];
			agent.setEntity(null);

			fitness.total += agent.fitness;
			fitness.best   = Math.max(fitness.best,  agent.fitness);
			fitness.worst  = Math.min(fitness.worst, agent.fitness);

		}

		fitness.average = fitness.total / oldpopulation.length;


		let elite = (oldpopulation.length / 5) | 0;
		if (elite % 2 === 1) {
			elite++;
		}

		let survivors = oldpopulation.slice(0, elite);
		if (survivors.length > 0) {
			newpopulation.push.apply(newpopulation, survivors);
		}


		let chromoroulette = newpopulation.length;

		while (newpopulation.length < oldpopulation.length && chromoroulette < oldpopulation.length) {

			let zw_agent = _get_agent_by_chromoroulette(oldpopulation, Math.random() * fitness.total);
			let zz_agent = _get_agent_by_chromoroulette(oldpopulation, Math.random() * fitness.total);

			if (zw_agent !== null && zz_agent !== null) {

				let babies = zw_agent.crossover(zz_agent);
				if (babies !== null) {

					if (newpopulation.indexOf(babies[0]) === -1) {
						newpopulation.push(babies[0]);
						babies[0].mutate();
					}

					if (newpopulation.indexOf(babies[1]) === -1) {
						newpopulation.push(babies[1]);
						babies[1].mutate();
					}

				}

			} else {

				chromoroulette++;

			}

		}


		if (newpopulation.length < oldpopulation.length) {

			if (lychee.debug === true) {
				console.warn('lychee.ai.Layer: Too less Agents for healthy Evolution');
			}


			let diff = oldpopulation.length - newpopulation.length;

			for (let o = 0; o < oldpopulation.length; o++) {

				if (newpopulation.indexOf(oldpopulation[o]) === -1) {
					newpopulation.push(oldpopulation[o]);
					diff--;
				}

				if (diff === 0) {
					break;
				}

			}

		}


		for (let np = 0, npl = newpopulation.length; np < npl; np++) {

			let agent  = newpopulation[np];
			let entity = entities[np];

			agent.sensors  = oldsensors[np];
			agent.controls = oldcontrols[np];

			agent.setEntity(entity);
			agent.setFitness(0);

			this.trigger('epoche', [ agent ]);

		}


		this.__population = newpopulation;

		oldpopulation = null;
		oldsensors    = null;
		oldcontrols   = null;

	};



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = Object.assign({}, data);


		this.lifetime = 30000;
		this.sensors  = [];
		this.controls = [];
		this.type     = Composite.TYPE.ENN;

		this.__fitness = {
			total:    0,
			average:  0,
			best:    -Infinity,
			worst:    Infinity
		};
		this.__population = [];
		this.__start      = null;


		this.setSensors(settings.sensors);
		this.setControls(settings.controls);
		this.setLifetime(settings.lifetime);

		delete settings.sensors;
		delete settings.controls;
		delete settings.lifetime;


		_Layer.call(this, settings);


		/*
		 * INITIALIZATION
		 */

		if (settings.type !== this.type) {
			this.setType(settings.type);
		} else {
			_initialize.call(this);
		}

		settings = null;

	};


	Composite.TYPE = {
		ENN:       0,
		NEAT:      1,
		HYPERNEAT: 2
	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Layer.prototype.serialize.call(this);
			data['constructor'] = 'lychee.ai.Layer';

			let settings = data['arguments'][0];
			let blob     = (data['blob'] || {});


			if (this.sensors.length > 0)          settings.sensors  = this.sensors.map(lychee.serialize);
			if (this.controls.length > 0)         settings.controls = this.controls.map(lychee.serialize);
			if (this.lifetime !== 30000)          settings.lifetime = this.lifetime;
			if (this.type !== Composite.TYPE.ENN) settings.type     = this.type;


			return data;

		},

		update: function(clock, delta) {

			_Layer.prototype.update.call(this, clock, delta);


			if (this.__start === null) {
				this.__start = clock;
			}


			let population = this.__population;
			for (let p = 0, pl = population.length; p < pl; p++) {

				let agent = population[p];

				agent.update(clock, delta);
				this.trigger('update', [ agent ]);

			}


			let t = (clock - this.__start) / this.lifetime;
			if (t > 1) {

				_epoche.call(this);

				this.__start = clock;

			}

		},



		/*
		 * CUSTOM API
		 */

		setControls: function(controls) {

			controls = controls instanceof Array ? controls.unique() : null;


			if (controls !== null) {

				this.controls = controls.filter(function(control) {
					return control instanceof Object;
				});

				return true;

			}


			return false;

		},

		setLifetime: function(lifetime) {

			lifetime = typeof lifetime === 'number' ? (lifetime | 0) : null;


			if (lifetime !== null) {

				this.lifetime = lifetime;

				return true;

			}


			return false;

		},

		setSensors: function(sensors) {

			sensors = sensors instanceof Array ? sensors.unique() : null;


			if (sensors !== null) {

				this.sensors = sensors.filter(function(sensor) {
					return sensor instanceof Object;
				});

				return true;

			}


			return false;

		},

		setType: function(type) {

			type = lychee.enumof(Composite.TYPE, type) ? type : null;


			if (type !== null) {

				let oldtype = this.type;
				if (oldtype !== type) {

					this.type = type;

					_initialize.call(this);

					return true;

				}

			}


			return false;

		}

	};


	return Composite;

});

