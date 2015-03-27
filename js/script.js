// initialize variables
var creature = {
	summon: {},
	control: {},
	costs: {}
};
var modifiers = {
	truename: 0
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
			var cdata = xml.find('creaturegroup:eq(' + el.attr('data-group') + ')').find('creature:eq(' + el.attr('data-creature') + ')');

			if (cdata.length !== 0) {

				// set slider values
				$('#summon_base').val(cdata.attr('summon')).slider('refresh');
				$('#control_base').val(cdata.attr('control')).slider('refresh');
				$('#costs_base').val(cdata.attr('costs')).slider('refresh');

				// set new creature base data
				creature.summon.base = cdata.attr('summon');
				creature.control.base = cdata.attr('control');
				creature.costs.base = cdata.attr('costs');

			}

		})
		// on pagechange
		.on('pagecontainerchange', function(e, data) {

			var page_id = data.toPage[0].id;
			if (page_id == 'summary') {

				$.each(modifiers, function(key,value) {
					switch (key) {
						case 'truename':
							creature.summon.truename = value * -1;
							creature.control.truename = Math.round(value/-3);
							break;
					}
				})
console.log(creature);
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