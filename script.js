


var $nextButton = $('.js-next');
var $prevButton = $('.js-prev');
var $wrapper = $('.js-wrapper');
var $progress = $('.js-progress');
var containersLength = $('.js-container').length - 1;


$wrapper.height($('.js-container:first').outerHeight());

$nextButton.on('click', function (e) {
	var offset = -100 * ($(this).closest('.js-container').index() + 1);
	$wrapper.css('margin-left', offset + '%');

	$wrapper.animate({height:$(this).closest('.js-container').next().outerHeight()},200);

	progress($(this).closest('.js-container').index());

});

$prevButton.on('click', function (e) {
	var offset = -100 * ($(this).closest('.js-container').index() + 1) + 200;
	$wrapper.css('margin-left', offset + '%');
	$wrapper.animate({height:$(this).closest('.js-container').prev().outerHeight()},200);
	progress($(this).closest('.js-container').index() - 2);
});


function progress(index){
	var progressWidth = (100 / containersLength) * (index + 1);
	$progress.css({"width": progressWidth +'%'});
}











// Pure js search
function create_custom_dropdowns() {
	$('select').each(function (i, select) {
		if (!$(this).next().hasClass('dropdown-select')) {
			$(this).after('<div class="dropdown-select wide ' + ($(this).attr('class') || '') + '" tabindex="0"><span class="current"></span><div class="list"><ul></ul></div></div>');
			var dropdown = $(this).next();
			var options = $(select).find('option');
			var selected = $(this).find('option:selected');
			dropdown.find('.current').html(selected.data('display-text') || selected.text());
			options.each(function (j, o) {
				var display = $(o).data('display-text') || '';
				dropdown.find('ul').append('<li class="option ' + ($(o).is(':selected') ? 'selected' : '') + '" data-value="' + $(o).val() + '" data-display-text="' + display + '">' + $(o).text() + '</li>');
			});
		}
	});

	$('.dropdown-select ul').before('<div class="dd-search"><input id="txtSearchValue" autocomplete="off" onkeyup="filter()" class="dd-searchbox" type="text"></div>');
}

// Event listeners

// Open/close
$(document).on('click', '.dropdown-select', function (event) {
	if($(event.target).hasClass('dd-searchbox')){
		return;
	}
	$('.dropdown-select').not($(this)).removeClass('open');
	$(this).toggleClass('open');
	if ($(this).hasClass('open')) {
		$(this).find('.option').attr('tabindex', 0);
		$(this).find('.selected').focus();
	} else {
		$(this).find('.option').removeAttr('tabindex');
		$(this).focus();
	}
});

// Close when clicking outside
$(document).on('click', function (event) {
	if ($(event.target).closest('.dropdown-select').length === 0) {
		$('.dropdown-select').removeClass('open');
		$('.dropdown-select .option').removeAttr('tabindex');
	}
	event.stopPropagation();
});

function filter(){
	var valThis = $('#txtSearchValue').val();
	$('.dropdown-select ul > li').each(function(){
		var text = $(this).text();
		(text.toLowerCase().indexOf(valThis.toLowerCase()) > -1) ? $(this).show() : $(this).hide();
	});
}
// Search

// Option click
$(document).on('click', '.dropdown-select .option', function (event) {
	$(this).closest('.list').find('.selected').removeClass('selected');
	$(this).addClass('selected');
	var text = $(this).data('display-text') || $(this).text();
	$(this).closest('.dropdown-select').find('.current').text(text);
	$(this).closest('.dropdown-select').prev('select').val($(this).data('value')).trigger('change');
});

// Keyboard events
$(document).on('keydown', '.dropdown-select', function (event) {
	var focused_option = $($(this).find('.list .option:focus')[0] || $(this).find('.list .option.selected')[0]);
	// Space or Enter
	//if (event.keyCode == 32 || event.keyCode == 13) {
	if (event.keyCode == 13) {
		if ($(this).hasClass('open')) {
			focused_option.trigger('click');
		} else {
			$(this).trigger('click');
		}
		return false;
		// Down
	} else if (event.keyCode == 40) {
		if (!$(this).hasClass('open')) {
			$(this).trigger('click');
		} else {
			focused_option.next().focus();
		}
		return false;
		// Up
	} else if (event.keyCode == 38) {
		if (!$(this).hasClass('open')) {
			$(this).trigger('click');
		} else {
			var focused_option = $($(this).find('.list .option:focus')[0] || $(this).find('.list .option.selected')[0]);
			focused_option.prev().focus();
		}
		return false;
		// Esc
	} else if (event.keyCode == 27) {
		if ($(this).hasClass('open')) {
			$(this).trigger('click');
		}
		return false;
	}
});

$(document).ready(function () {
	create_custom_dropdowns();
});








// PDF generate
function fillRandomData() {
	$.each($('#accident-form .form-group'), function (index, el) {
		var $input = $(el).find('[placeholder]');
		if ($input.length && $input.attr('placeholder')){
			$input.val($input.attr('placeholder'))
		}
	})
}
function bodyRows() {
	var data = $('form').serializeArray();
	var body = [];
	$.each($('#accident-form .form-group'), function (index, el) {
		if ($(el).find('input').val()){
			var labelText = $('#accident-form .form-group').eq(index).clone()
				.find('span')
				.remove()
				.end()
				.text();

			body.push({
				record: $.trim(labelText),
				information: $.trim($(el).find('input').val())
			});
		}
	});
	return body;
}

function generatePdf() {
	var doc = new jsPDF();

	doc.setFontSize(22);
	doc.text('What To Do After A California Car Accident', 14, 22);
	doc.setFontSize(11);
	doc.setTextColor(100);

	// jsPDF 1.4+ uses getWidth, <1.4 uses .width
	var pageSize = doc.internal.pageSize;
	var pageWidth = pageSize.width ? pageSize.width : pageSize.getWidth();
	var text = doc.splitTextToSize('You’re going to want records and accounts documenting the crash. You’ll need this for insurance, but you’ll also need records to provide to a lawyer if you decide to obtain legal help.', pageWidth - 35, {});
	doc.text(text, 14, 30);




	doc.autoTable({
		body: bodyRows(),
		startY: 50,
		showHead: 'firstPage',
		columnStyles: {
			0: {cellWidth: 60},
		}
	});

	doc.text(text, 14, doc.autoTable.previous.finalY + 10);
	doc.save('Steps after being injured in an accident.pdf');
}

$('#fillRandomData').click(function (e) {
	e.preventDefault();
	fillRandomData();
});

$('#generatePDF').click(function (e) {
	e.preventDefault();
	generatePdf()
})




// getpicture
var video = document.querySelector('.panel-video video');

$('.js-take-picture').click(function(e) {
	e.preventDefault();
	console.log($(this).data('init'))

	if ($(this).data('init') === false){
		$(this).data('init', true);
		$(this).text('Take a Picture');
		initVideo();
	}
	else{
		getScreenshoot();
	}
});

function initVideo() {
	// Check if navigator object contains getUserMedia object.
	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;


	// Check for getUserMedia support.
	if (navigator.getUserMedia) {
		// Get video stream.
		navigator.getUserMedia({
			video: true
		}, gotStream, noStream);
	} else {
		// No getUserMedia support.
		alert('Your browser does not support getUserMedia API.');
	}
}

// Stream error.
function noStream(err) {
	alert('Could not get camera stream.');
	console.log('Error: ', err);
};

// Stream success.
function gotStream(stream) {
	// Feed webcam stream to video element.
	// IMPORTANT: video element needs autoplay attribute or it will be frozen at first frame.
	video.srcObject = stream;
}

function getScreenshoot() {
	if (video.srcObject) {
		var img = document.createElement('img');
		var context;
		var width = video.offsetWidth;
		var height = video.offsetHeight;

		var canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;

		context = canvas.getContext('2d');
		context.drawImage(video, 0, 0, width, height);

		img.src = canvas.toDataURL('image/png');

		$('.panel-thumbnails').append(img);
	}
}

