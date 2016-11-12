
lychee.define('lychee.policy.Position').exports(function(lychee, global, attachments) {

	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(settings, entity) {

		this.entity = entity || null;
		this.limit  = settings.limit;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			let settings = {
				limit: this.limit
			};


			return {
				'reference': 'lychee.policy.Position',
				'arguments': [ settings ]
			};

		},



		/*
		 * CUSTOM API
		 */

		sensor: function() {

			let entity = this.entity;
			let limit  = this.limit;
			let values = [];

			if (entity.position instanceof Object) {

				values.push(
					entity.position.x / limit,
					entity.position.y / limit,
					entity.position.z / limit
				);

			}


			return values;

		},

		control: function(values) {

			let x = values[0] * limit;
			let y = values[1] * limit;
			let z = values[2] * limit;

			if (entity.position instanceof Object) {
				entity.position.x = x;
				entity.position.y = y;
				entity.position.z = z;
			}

		}

	};


	let Callback = function(data) {

		let settings = lychee.assignsafe({
			limit: 0xffffffff
		}, data);


		return Composite.bind(Composite, settings);

	};


	return Callback;

});

