
lychee.define('lychee.policy.Velocity').exports(function(lychee, global, attachments) {

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
				'reference': 'lychee.policy.Velocity',
				'arguments': [ settings ]
			};

		},



		/*
		 * CUSTOM API
		 */

		sensor: function() {

			let entity = this.entity;
			let limit  = this.limit;
			let values = [ 0.5, 0.5, 0.5 ];


			if (entity !== null) {

				values[0] = entity.velocity.x / limit;
				values[1] = entity.velocity.y / limit;
				values[2] = entity.velocity.z / limit;

			}


			return values;

		},

		control: function(values) {

			let entity = this.entity;
			let limit  = this.limit;
			let x      = values[0] * limit;
			let y      = values[1] * limit;
			let z      = values[2] * limit;


			if (entity !== null) {

				entity.velocity.x = x;
				entity.velocity.y = y;
				entity.velocity.z = z;

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

