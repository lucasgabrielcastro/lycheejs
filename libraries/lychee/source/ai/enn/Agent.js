
lychee.define('lychee.ai.enn.Agent').includes([
	'lychee.ai.Agent'
]).requires([
	'lychee.ai.Genome',
	'lychee.ai.enn.Brain'
]).exports(function(lychee, global, attachments) {

	const _Agent  = lychee.import('lychee.ai.Agent');
	const _Genome = lychee.import('lychee.ai.Genome');
	const _Brain  = lychee.import('lychee.ai.enn.Brain');



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = Object.assign({}, data);


		this.genome = null;


		settings.brain  = new _Brain();
		settings.genome = settings.genome : new _Genome();

		_Agent.call(this, settings);


		this.setGenome(settings.genome);

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

			agent = lychee.interfaceof(Composite, agent) ? agent : null;


			if (agent !== null) {

				let zw_genome = this.genome;
				let zz_genome = agent.genome;

				if (this.brain !== null && agent.brain !== null) {
					zw_genome.setGene('weights', this.brain.getWeights());
					zz_genome.setGene('weights', agent.brain.getWeights());
				}


				let zw_dna = zw_genome.getGene('weights');
				let zz_dna = zz_genome.getGene('weights');

				if (zw_dna.length === zz_dna.length) {

					let zw0_dna   = [];
					let zw1_dna   = [];
					let dna_split = (Math.random() * zw_dna.length) | 0;


					for (let d = 0, dl = zw_dna.length; d < dl; d++) {

						if (d <= dna_split) {
							zw0_dna.push(zw_dna[d]);
							zw1_dna.push(zz_dna[d]);
						} else {
							zw0_dna.push(zz_dna[d]);
							zw1_dna.push(zw_dna[d]);
						}

					}


					let zw0_genome = lychee.deserialize(lychee.serialize(zw_genome));
					let zw1_genome = lychee.deserialize(lychee.serialize(zz_genome));

					zw0_genome.setGene('weights', zw0_dna);
					zw1_genome.setGene('weights', zw1_dna);


// TODO: This won't work. Brain has default settings currently
// TODO: Serialize Brain directly and restore its settings
// TODO: Use genes for inputs, outputs etc. and restore brain's
// internal __size maps.

// Brain currently has _NOT_ the settings via setSensors() and setControls()


					let zw0_baby = new Composite({ genome: zw0_genome });
					let zw1_baby = new Composite({ genome: zw1_genome });


					return [ zw0_baby, zw1_baby ];

				}

			}


			return null;

		},

		mutate: function() {

			// TODO: mutate() genome of brainz

		},

		setGenome: function(genome) {

			genome = genome instanceof _Genome ? genome : null;


			if (genome !== null) {

				this.genome = genome;


				let brain = this.brain;
				if (brain !== null) {

					let gene = genome.getGene('weights');
					if (gene.length > 0) {

						brain.setWeights(gene);

					} else {

						genome.setGene('weights', brain.getWeights());

					}

				}


				return true;

			}


			return false;

		}


	};


	return Composite;

});

