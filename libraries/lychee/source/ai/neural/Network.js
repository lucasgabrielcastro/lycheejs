
lychee.define('lychee.ai.neural.Network').exports(function(lychee, global, attachments) {

	const _BIAS                = -1;
	const _ACTIVATION_RESPONSE =  1;



	/*
	 * HELPERS
	 */

	const _Neuron = function(weights) {

		weights = typeof weights === 'number' ? weights : 1;


		this.weights = [];

		for (let w = 0; w < weights; w++) {
			this.weights.push(Math.random() - Math.random());
		}

		// Threshold (bias) that is multiplied by -1
		this.weights.push(Math.random() - Math.random());

	};

	const _Layer = function(neurons, weights) {

		neurons = typeof neurons === 'number' ? neurons : 1;
		weights = typeof weights === 'number' ? weights : 1;


		this.neurons = [];

		for (let n = 0; n < neurons; n++) {
			this.neurons.push(new _Neuron(weights));
		}

	};

	const _sigmoid = function(input, response) {
		return (1 / (1 + Math.exp(-1 * input / response)));
	};



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = lychee.assignsafe({
			inputs:  2,
			outputs: 2,
			layers:  1,
			neurons: 4
		}, data);


		this.layers = [];


		// Input Layer
		this.layers.push(new _Layer(settings.neurons, settings.inputs));

		// Hidden Layers
		for (let l = 0; l < layers - 1; l++) {
			this.layers.push(new _Layer(settings.neurons, settings.neurons));
		}

		// Output Layer
		this.layers.push(new _Layer(settings.outputs, settings.inputs));

	};


	Composite.prototype = {

		update: function(inputs) {

			let outputs = [];

			for (let l = 0; l < this.layers.length; l++) {

				let layer = this.layers[l];

				if (l > 0) {
					inputs  = outputs;
					outputs = [];
				}


				for (let n = 0; n < layer.neurons.length; n++) {

					let count  = 0;
					let neuron = layer.neurons[n];

					let netinput = 0;
					let wl       = neuron.weights.length;

					for (let w = 0; w < wl - 1; w++) {
						netinput += neuron.weights[w] * inputs[count++];
					}

					netinput += neuron.weights[wl - 1] * _BIAS;

					outputs.push(_sigmoid(netinput, _ACTIVATION_RESPONSE));

				}

			}


			return outputs;

		},

		countWeights: function() {

			let amount = 0;


			let layers = this.layers;
			if (layers.length > 0) {

				layers.forEach(function(layer) {

					layer.neurons.forEach(function(neuron) {
						amount += neuron.weights.length;
					});

				});

			}


			return amount;

		},

		getWeights: function() {

			let layers = this.layers;
			if (layers.length > 0) {

				let weights = [];


				layers.forEach(function(layer) {

					layer.neurons.forEach(function(neuron) {

						neuron.weights.forEach(function(weight, w) {
							weights.push(weight);
						});

					});

				});


				return weights;

			}


			return null;

		},

		setWeights: function(weights) {

			let layers = this.layers;
			if (layers.length > 0) {

				let index = 0;

				layers.forEach(function(layer) {

					layer.neurons.forEach(function(neuron) {

						neuron.weights.forEach(function(weight, w) {
							neuron.weights[w] = weights[index++];
						});

					});

				});


				return true;

			}


			return false;

		}

	};


	return Composite;

});

