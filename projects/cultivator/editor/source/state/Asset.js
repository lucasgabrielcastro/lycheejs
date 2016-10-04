
lychee.define('app.state.Asset').includes([
	'lychee.ui.State'
]).requires([
//	'app.ui.element.Entity',
	'app.ui.element.Font',
//	'app.ui.element.Sprite',
	'lychee.ui.Blueprint',
	'lychee.ui.Element',
	'lychee.ui.Layer',
	'lychee.ui.element.Search'
]).exports(function(lychee, global, attachments) {

	const _State = lychee.import('lychee.ui.State');
	const _BLOB  = attachments["json"].buffer;



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(main) {

		_State.call(this, main);


		this.api = main.api || null;


		this.deserialize(_BLOB);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			let data = _State.prototype.serialize.call(this);
			data['constructor'] = 'app.state.Asset';


			return data;

		},

		deserialize: function(blob) {

			_State.prototype.deserialize.call(this, blob);




		},

		enter: function(oncomplete, data) {

			let project = this.main.project;
			let select  = this.queryLayer('ui', 'asset > select');

			if (project !== null && select !== null) {

				let filtered = project.getAssets();

				select.setData(filtered);

			}


			_State.prototype.enter.call(this, oncomplete, data);

		}

	};


	return Composite;

});

