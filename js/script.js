// initialize variables
var creature = {
	summon: {},
	control: {},
	costs: {},
};
var summoner = {
	zfw: {
		base: 11,
	},
};
var modifiers = {
	truename: 0,
	outfit: 0,
	candle: 0,
	chalk: 0,
	sword: 0,
	integra: 0,
	circle: 0,
};
var xml = '';

$(function() {

	// parse xml
	$.get('/xml/creature.xml').done(function(data) {

		// define xml
		xml = $(data);

		// create select
		var s = $('<select name="creature-selector" id="creature-selector"/>', {});
		$('<option data-group="na" data-creature="na">Benutzerdefiniert</option>').appendTo(s);

		// fetch all groups
		var groups = xml.find('creaturegroup');
		groups.each(function (gi) {

			// create optgroup
			var g = $('<optgroup />', { label: $(this).attr('name') });

			// fetch all creatures
			var creatures = $(this).find('creature')
			creatures.each(function (oi) {

				// create option
				$('<option data-group="' + gi + '" data-creature="' + oi + '">' + $(this).html() + '</option>').appendTo(g);

			});

			// append optgroup to select
			g.appendTo(s);

		});

		// replace placeholder with select and style it
		$('#creature-selector').replaceWith(s);
		$('select').selectmenu();

	});

	$('body')
		// set values for slider change
		.on('change', 'input[type="number"]', function(e) {

			// init element
			var el = $(this);

			// get value of element
			var val = el.val();

			// set variable to value of element
			if (el.attr('data-relation') == 'creature') {
				var id = el.attr('id').split('_');
				creature[id[0]][id[1]] = val;
			} else if (el.attr('data-relation') == 'summoner') {
				var id = el.attr('id').split('_');
				summoner[id[0]][id[1]] = val;
			} else {
				modifiers[el.attr('id')] = val;
			}

			// reset select
			$("#creature-selector option:first").attr('selected','selected');
			$("#creature-selector").selectmenu('refresh');

		})
		// set sliders to selection
		.on('change', '#creature-selector', function(e) {

			// init element
			var el = $(this).find(':selected');

			// get data
			var gdata = xml.find('creaturegroup:eq(' + el.attr('data-group') + ')');
			var cdata = gdata.find('creature:eq(' + el.attr('data-creature') + ')');

			if (cdata.length !== 0) {

				// set slider values
				$('#summon_base').val(cdata.attr('summon')).slider('refresh');
				$('#control_base').val(cdata.attr('control')).slider('refresh');
				$('#costs_base').val(cdata.attr('costs')).slider('refresh');

				// set new creature base data
				creature.summon.base = cdata.attr('summon');
				creature.control.base = cdata.attr('control');
				creature.costs.base = cdata.attr('costs');

				// set creature type select
				var ctype = gdata.attr('creaturetype');
				$('#creature_type').val(ctype).selectmenu('refresh');;

			}

		})
		// set values for radio change
		.on('change', '[type="radio"]', function(e) {

			// init element
			var el = $(this);

			// get value of element
			var val = el.val();

			// set variable to value of element
			modifiers[el.attr('name')] = val;

		})
		// set values for checkbox change
		.on('change', '[type="checkbox"]', function(e) {

			// init element
			var el = $(this);

			// get value of element
			var val = ( el.is(':checked') ? 1 : 0 );

			// set variable to value of element
			modifiers[el.attr('id')] = val;

		})
		// on pagechange
		.on('pagecontainerchange', function(e, data) {

			var page_id = data.toPage[0].id;
			if (page_id == 'summary') {

				$.each(modifiers, function(key,value) {
					if (value == 0) {
						delete creature.summon[key];
						delete creature.control[key];
						return true;
					}
					switch (key) {
						case 'truename':
							creature.summon[key] = value * -1;
							creature.control[key] = Math.round(value/-3);
							break;
						case 'outfit':
						case 'sword':
							creature.summon[key] = value * -1;
							creature.control[key] = value * -1;
							break;
						case 'integra':
							summoner.zfw[key] = 7;
							break;
						case 'candle':
							switch (value) {
								case 'na':
								case 'a':
									delete creature.summon[key];
									delete creature.control[key];
									break;
								case 'b':
									creature.summon[key] = -1;
									break;
								case 'c':
									creature.control[key] = -1;
									break;
								case 'd':
									creature.summon[key] = -1;
									creature.control[key] = -1;
									break;
								case 'e':
									creature.summon[key] = -2;
									creature.control[key] = -2;
									break;
								case 'f':
									creature.summon[key] = -3;
									creature.control[key] = -3;
									break;
							}
							break;
						case 'chalk':
							switch (value) {
								case 'na':
								case 'b':
									delete creature.summon[key];
									delete creature.control[key];
									break;
								case 'a':
								case 'c':
									creature.summon[key] = -1;
									break;
								case 'd':
									creature.summon[key] = -1;
									creature.control[key] = -1;
									break;
								case 'e':
									creature.summon[key] = -2;
									creature.control[key] = -1;
									break;
								case 'f':
									creature.summon[key] = -3;
									creature.control[key] = -2;
									break;
							}
							break;
						case 'circle':
							creature.summon[key] = value * -1;
							creature.control[key] = (value * -1) - 3;
							break;
					}
				})

				$.each(summoner, function(key,value) {
					var sum = 0;
					var detail = '';
					$.each(value, function(k,v) {
						x = parseInt(v);
						if (x < 0 || k == 'base') {
							detail += v;
						} else {
							detail += '+' + v;
						}
						sum += x;
					})
					$('#summary #summary_' + key + '_detail').html(detail);
					$('#summary #summary_' + key).html(sum);
				});

				$.each(creature, function(key,value) {
					var sum = 0;
					var detail = '';
					$.each(value, function(k,v) {
						x = parseInt(v);
						if (x < 0 || (key == 'costs' && k == 'base')) {
							detail += v;
						} else {
							detail += '+' + v;
						}
						sum += x;
					})
					if (sum > -1 && key != 'costs') {
						sum = '+' + sum;
					}
					$('#summary #summary_' + key + '_detail').html(detail);
					$('#summary #summary_' + key).html(sum);
				});

			}

			$('[data-role="footer"] [href]').removeClass('ui-disabled');	
			$('[href="#' + page_id + '"]').addClass('ui-disabled');	

		})

})