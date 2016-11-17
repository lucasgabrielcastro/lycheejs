
lychee.define('lychee.ai.enn.Brain').exports(function(lychee, global, attachments) {

	const _NEURON_BIAS = -1;



	/*
	 * HELPERS
	 */

	const _init_network = function() {

		let input_size = this.__sensors_map.reduce(function(a, b) {
			return a + b;
		}, 0);

		let output_size = this.__controls_map.reduce(function(a, b) {
			return a + b;
		}, 0);


		let hidden_size = 1;
		let weight_size = 0;

		if (input_size > output_size) {
			hidden_size = input_size;
		} else {
			hidden_size = output_size;
		}


		let layer_amount = 6;

		for (let l = 0; l < layer_amount; l++) {

			let prev = hidden_size;
			let size = hidden_size;

			if (l === 0) {
				prev = 0;
				size = input_size;
			} else if (l === 1) {
				prev = input_size;
				size = hidden_size;
			} else if (l === layer_amount - 1) {
				prev = hidden_size;
				size = output_size;
			}


			let layer = new Array(size);

			for (let n = 0, nl = layer.length; n < nl; n++) {

				let neuron = {
					value:   0.5,
					weights: []
				};

				for (let p = 0; p < prev; p++) {
					neuron.weights.push(Math.random() * 0.4 - 0.2);
					weight_size++;
				}

				layer[n] = neuron;

			}

			this.__layers[l] = layer;

		}


		this.__input_size  = input_size;
		this.__hidden_size = hidden_size;
		this.__output_size = output_size;
		this.__weight_size = weight_size;

	};

	const _sigmoid = function(value) {

		return (1 / (1 + Math.exp(-1 * value)));

	};



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = Object.assign({}, data);


		this.controls = [];
		this.sensors  = [];

		this.__controls_map = [];
		this.__layers       = [];
		this.__sensors_map  = [];


		// cache structures
		this.__input_size  = 0;
		this.__hidden_size = 0;
		this.__output_size = 0;
		this.__weight_size = 0;


		this.setSensors(settings.sensors);
		this.setControls(settings.controls);

		settings = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let settings = {};
			let blob     = {};


			if (this.controls.length > 0) settings.controls = lychee.serialize(this.controls);
			if (this.sensors.length > 0)  settings.sensors  = lychee.serialize(this.sensors);


			// TODO: Brain serialization
			// of neural network structures


			return {
				'constructor': 'lychee.ai.enn.Brain',
				'arguments':   [ settings ],
				'blob':        Object.keys(blob).length > 0 ? blob : null
			};

		},

		update: function(clock, delta) {

			let controls     = this.controls;
			let controls_map = this.__controls_map;
			let sensors      = this.sensors;
			let sensors_map  = this.__sensors_map;
			let training     = {
				inputs:  null,
				outputs: null
			};


			let inputs = [];

			for (let s = 0, sl = sensors.length; s < sl; s++) {

				let sensor = sensors[s];
				let values = sensor.sensor();

				inputs.push.apply(inputs, values);

			}

			training.inputs = inputs;


			let input_layer = this.__layers[0];

			for (let il = 0, ill = input_layer.length; il < ill; il++) {
				input_layer[il].value = inputs[il];
			}


			let outputs = [];

			for (let l = 0, ll = this.__layers.length; l < ll; l++) {

				let layer = this.__layers[l];


				if (l > 0 && layer.length > 0) {
					inputs  = outputs;
					outputs = [];
				}


				for (let n = 0, nl = layer.length; n < nl; n++) {

					let count  = 0;
					let neuron = layer[n];
					let value  = 0;

					let wl = neuron.weights.length;

					for (let w = 0; w < wl - 1; w++) {
						value += neuron.weights[w] * inputs[count++];
					}

					value += neuron.weights[wl - 1] * _NEURON_BIAS;

					neuron.value = _sigmoid(value);


					outputs.push(neuron.value);

				}

			}

			training.outputs = outputs;


			let offset = 0;

			for (let c = 0, cl = controls_map.length; c < cl; c++) {

				let control = controls[c];
				let length  = controls_map[c];
				let values  = [].slice.call(outputs, offset, length);

				if (values.length > 0) {
					control.control(values);
				}

				offset += length;

			}


			return training;

		},



		/*
		 * CUSTOM API
		 */

		train: function(training) {

			training = training instanceof Object ? training : null;


			if (training !== null) {

				// XXX: Fast-Forward NN has no training

				return true;

			}


			return false;

		},

		setControls: function(controls) {

			controls = controls instanceof Array ? controls : null;


			if (controls !== null) {

				this.controls = controls;

				this.__controls_map = controls.map(function(control) {
					return (control.sensor() || [1]).length;
				});


				let output_size = this.__controls_map.reduce(function(a, b) {
					return a + b;
				}, 0);

				if (output_size !== this.__output_size) {
					_init_network.call(this);
				}


				return true;

			}


			return false;

		},

		setSensors: function(sensors) {

			sensors = sensors instanceof Array ? sensors : null;


			if (sensors !== null) {

				this.sensors = sensors;

				this.__sensors_map = sensors.map(function(sensor) {
					return (sensor.sensor() || [1]).length;
				});


				let input_size = this.__sensors_map.reduce(function(a, b) {
					return a + b;
				}, 0);

				if (input_size !== this.__input_size) {
					_init_network.call(this);
				}


				return true;

			}


			return false;

		},

		getWeights: function() {

			let layers  = this.__layers;
			let weights = [];


			for (let l = 0, ll = this.__layers.length; l < ll; l++) {

				let layer = this.__layers[l];

				for (let n = 0, nl = layer.length; n < nl; n++) {

					let neuron = layer[n];
					if (neuron.weights.length !== 0) {

						for (let w = 0, wl = neuron.weights.length; w < wl; w++) {
							weights.push(neuron.weights[w]);
						}

					}

				}

			}


			this.__weight_size = weights.length;


			return weights;

		},

		setWeights: function(weights) {

			weights = weights instanceof Array ? weights : null;


			if (weights !== null) {

				let size = this.__weight_size;
				if (size === weights.length) {

					let count  = 0;
					let layers = this.__layers;

					for (let l = 0, ll = this.__layers.length; l < ll; l++) {

						let layer = this.__layers[l];

						for (let n = 0, nl = layer.length; n < nl; n++) {

							let neuron = layer[n];
							if (neuron.weights.length !== 0) {

								for (let w = 0, wl = neuron.weights.length; w < wl; w++) {
									neuron.weights[w] = weights[count++];
								}

							}

						}

					}


					return true;

				}

			}


			return false;

		}

	};


	return Composite;

});

