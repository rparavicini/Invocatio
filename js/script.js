// initialize variables
var creature = {};
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

	// set creature basic data
	creature.summon_base = $('#summon_base').val();
	creature.control_base = $('#control_base').val();
	creature.costs_base = $('#costs_base').val();

	// set values for slider change
	$('input[type="number"]').on('change', function(e) {

		// init element
		var el = $(this);

		// get value of element
		var val = el.val();

		// set variable to value of element
		creature[el.attr('id')] = val;

		// reset select
		$("#creature-selector option:first").attr('selected','selected');
		$("#creature-selector").selectmenu('refresh');

	});

	// set sliders to selection
	$('body')
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
				creature.summon_base = cdata.attr('summon');
				creature.control_base = cdata.attr('control');
				creature.costs_base = cdata.attr('costs');

			}

		})
		.on('pagecontainerchange', function(e, data) {

			var page_id = data.toPage[0].id;
			if (page_id == 'summary') {

				$.each(creature, function(key,value) {
					$('#summary #summary_' + key).html(value);
				});

			}

			$('[data-role="footer"] [href]').removeClass('ui-disabled');	
			$('[href="#' + page_id + '"]').addClass('ui-disabled');	

		})

})