
lychee.define('lychee.ai.Agent').exports(function(lychee, global, attachments) {

	/*
	 * HELPERS
	 */

	const _validate_entity = function(entity) {

		if (entity instanceof Object) {
			return true;
		}


		return false;

	};



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = Object.assign({}, data);


		this.entity   = null;
		this.fitness  = 0;
		this.sensors  = [];
		this.controls = [];


		this.setEntity(settings.entity);
		this.setSensors(settings.sensors);
		this.setControls(settings.controls);


		settings = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		update: function(clock, delta) {

			// TODO: Update brain

		},



		/*
		 * CUSTOM API
		 */

		reward: function(diff) {

			diff = typeof diff === 'number' ? (diff | 0) : 1;

			this.fitness += diff;

		},

		punish: function(diff) {

			diff = typeof diff === 'number' ? (diff | 0) : 1;

			this.fitness -= diff;

		},

		setControls: function(controls) {

			controls = controls instanceof Array ? controls : null;


			if (controls !== null) {

				this.controls = controls.filter(function(control) {
					return control instanceof Object;
				});


				return true;

			}


			return false;

		},

		setEntity: function(entity) {

			entity = _validate_entity(entity) === true ? entity : null;


			if (entity !== null) {

				this.entity = entity;

				return true;

			}


			return false;

		},

		setSensors: function(sensors) {

			sensors = sensors instanceof Array ? sensors : null;


			if (sensors !== null) {

				this.sensors = sensors.filter(function(sensor) {
					return sensor instanceof Object;
				});


				return true;

			}


			return false;

		}

	};


	return Composite;

});

