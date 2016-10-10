
lychee.define('app.state.Asset').includes([
	'lychee.ui.State'
]).requires([
	'app.ui.element.modify.Font',
//	'app.ui.element.modify.Music',
//	'app.ui.element.modify.Sound',
//	'app.ui.element.modify.Sprite',
	'lychee.ui.Blueprint',
	'lychee.ui.Element',
	'lychee.ui.Layer',
	'lychee.ui.element.Search'
]).exports(function(lychee, global, attachments) {

	const _State  = lychee.import('lychee.ui.State');
	const _Font   = lychee.import('app.ui.element.modify.Font');
	const _Music  = lychee.import('app.ui.element.modify.Music');
	const _Sound  = lychee.import('app.ui.element.modify.Sound');
	const _Sprite = lychee.import('app.ui.element.modify.Sprite');
	const _BLOB   = attachments["json"].buffer;



	/*
	 * HELPERS
	 */

	const _on_change = function(value) {

		let layer   = this.queryLayer('ui', 'asset');
		let modify  = this.queryLayer('ui', 'asset > modify');
		let project = this.main.project;
		let tmp     = value.split(/\s\((.*)\)$/g);
		let path    = tmp[0];
		let type    = tmp[1];


		if (modify !== null) {
			layer.removeEntity(modify);
		}


		if (type === 'Font') {

			let asset = new Font(project.identifier + '/source/' + path + '.fnt');

			asset.onload = function() {

				layer.setEntity('modify', new _Font({
					width:  320,
					height: 620,
					font:   asset
				}));

				layer.trigger('relayout');

			};

			asset.load();

		}

	};



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


			this.queryLayer('ui', 'asset > select').bind('change', _on_change, this);

		},

		enter: function(oncomplete, data) {

			let project = this.main.project;
			let select  = this.queryLayer('ui', 'asset > select');

			if (project !== null && select !== null) {

				let filtered = [];
				let assets   = project.getAssets();

				assets.forEach(function(asset) {

					let ext  = asset.split('.').pop();
					let path = asset.split('.').slice(0, -1).join('.');
					let map  = assets.indexOf(path + '.json');

					if (ext === 'png' && map !== -1) {
						filtered.push(path + ' (Sprite)');
					} else if (ext === 'fnt') {
						filtered.push(path + ' (Font)');
					} else if (ext === 'msc') {
						filtered.push(path + ' (Music)');
					} else if (ext === 'snd') {
						filtered.push(path + ' (Sound)');
					}

				});

				select.setData(filtered);

			}


			_State.prototype.enter.call(this, oncomplete, data);

		}

	};


	return Composite;

});

