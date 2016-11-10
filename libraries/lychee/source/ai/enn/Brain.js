
lychee.define('lychee.ai.enn.Brain').exports(function(lychee, global, attachments) {

	const _ACTIVATION_RESPONSE =  1;
	const _ACTIVATION_BIAS     = -1;



	/*
	 * HELPERS
	 */

	const _sigmoid = function(input, response) {

		return (1 / (1 + Math.exp(-1 * input / response)));

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
			// in form of Genome (for enn.Agent mutate / crossover)


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


			let inputs = [];

			for (let s = 0, sl = sensors.length; s < sl; s++) {

				let sensor = sensors[s];
				let values = sensors.sensor();

				inputs.push.apply(inputs, values);

			}


			let outputs = [];

			for (let l = 0, ll = this.__layers.length; l < ll; l++) {

				let layer = this.__layers[l];

				if (l > 0) {
					inputs  = outputs;
					outputs = [];
				}

				for (let n = 0, nl = layer.length; n < nl; n++) {

					let count  = 0;
					let value  = 0;
					let neuron = layer[n];


					let wl = neuron.length;

					for (let w = 0; w < wl - 1; w++) {
						value += neuron[w] * inputs[count++];
					}

					value += neuron[wl - 1] * _ACTIVATION_BIAS;


					let tmp = _sigmoid(value, _ACTIVATION_RESPONSE);

					// TODO: Try out RNN / reinforcement here
					// maybe LSTM gateways will work, too!?
					// neuron.push(tmp);

					outputs.push(tmp);

				}

			}


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

		},



		/*
		 * CUSTOM API
		 */

		setControls: function(controls) {

			controls = controls instanceof Array ? controls : null;


			if (controls !== null) {

				this.controls = controls;

				this.__controls_map = controls.map(function(control) {
					return (control.sensor() || [1]).length;
				});


				// TODO: Initialize layers[layers.length - 1]
				// modify hidden layers.length


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


				// TODO: Initialize layers[0]
				// modify hidden layers.length


				return true;

			}


			return false;

		}

	};


	return Composite;

});

