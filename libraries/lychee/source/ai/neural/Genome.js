
lychee.define('lychee.ai.neural.Genome').exports(function(lychee, global, attachments) {



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(weights) {

		weights = typeof weights === 'number' ? weights : 0;


		this.fitness = 0;
		this.weights = [];


		for (let w = 0; w < weights; w++) {
			this.weights.push(Math.random() - Math.random());
		}

	};

	Composite.prototype = {

		crossover: function(partner, babies) {

			let dnalength = this.weights.length;


			partner = partner instanceof _Genome ? partner : null;
			babies  = babies instanceof Array    ? babies  : [ new Composite(dnalength), new Composite(dnalength) ];


			if (partner !== null && babies.length > 0) {

				let that = this;

				babies.forEach(function(baby, index) {

					let parent_a = (index % 2 === 0) ? that    : partner;
					let parent_b = (index % 2 === 0) ? partner : that;
					let dnasplit = (Math.random() * (dnalength + 0.999999)) | 0;


					for (let w0 = 0; w0 < dnasplit; w0++) {
						baby.weights[w0] = parent_a.weights[w0];
					}

					for (let w1 = dnasplit; w1 < length; w1++) {
						baby.weights[w1] = parent_b.weights[w1];
					}

				});


				return babies;

			}


			return null;

		},

		mutate: function() {

			// Mutation Rate: 0.1
			// Maximal Perturbation Rate: 0.3

			this.weights = this.weights.map(function(value) {

				if (Math.random() < 0.1) {
					return value + (Math.random() - Math.random()) * 0.3;
				} else {
					return value;
				}

			});

		}

	};


	return Composite;

});

