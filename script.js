var $nextButton = $('.js-next');
var $prevButton = $('.js-prev');
var $wrapper = $('.js-wrapper');
var $progress = $('.js-progress');
var $witnessClone = $('#clone-form-group');
var containersLength = $('.js-container').length - 1;

$( document ).ready(function() {
    // listen to events...
    $('.js-container').not(':first-child').css('height', 0);

    function slideRight(el){
        $('.js-container').not($(el).closest('.js-container').next()).css('height', 0);
        $(el).closest('.js-container').next().css('height', 'auto');

        var offset = -100 * ($(el).closest('.js-container').index() + 1);
        if (offset >  -100 * ($('.js-container').length + 1) ){
            $wrapper.css('margin-left', offset + '%');
            progress($(el).closest('.js-container').index());
        }
    }

    function slideLeft(el){
        $('.js-container').not($(el).closest('.js-container').prev()).css('height', 0);
        $(el).closest('.js-container').prev().css('height', 'auto');

        var offset = -100 * ($(el).closest('.js-container').index() + 1) + 200;
        if (offset < 100) {
            $wrapper.css('margin-left', offset + '%');
            progress($(el).closest('.js-container').index() - 2);
        }
    }

    $nextButton.on('click', function (e) {
        slideRight(e.target);
    });

    $prevButton.on('click', function (e) {
        slideLeft(e.target);
    });
});

function progress(index){
    var progressWidth = (100 / containersLength) * (index + 1);
    $progress.css({"width": progressWidth +'%'});
}

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

create_custom_dropdowns();

// Google map
// ================
function initPlacesMap(id, selectorId, pos, fallbackQuery) {
    // Google map
    var map;
    var infoWindow;
    var markers = [];
    var searchInput = document.getElementById(selectorId);
    searchInput.value = fallbackQuery;

    infoWindow = new google.maps.InfoWindow;

    var placeStr = document.getElementById(id).dataset.place;

    doSearch(pos);
    searchInput.addEventListener("keyup", function(event) {
        event.preventDefault();
        if (event.keyCode === 13) {
            doSearch(pos);
        }
    });

    function doSearch(pos) {
        // Try HTML5 geolocation.
        map = new google.maps.Map(document.getElementById(id), {
            center: pos,
            zoom: 14
        });

        callService( map, placeStr, pos);
    }

    function callback(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            for (var i = 0; i < results.length; i++) {
                createMarker(results[i]);
            }
        }
    }

    var prevInfowindow = false;

    function createMarker(place) {
        var marker = new google.maps.Marker({
            position: place.geometry.location,
            map: map,
            title: place.name
        });

        var infowindow = new google.maps.InfoWindow({
            content: '<b>' + place.name + '</b> <br>'
                + '<i>' + place.rating + ' out of ' + place.user_ratings_total + ' stars </i><br>'
                + place.formatted_address
        });

        marker.addListener('click', function() {
            if( prevInfowindow ) {
                prevInfowindow.close();
            }

            prevInfowindow = infowindow;
            infowindow.open(map, marker);
        });

        markers.push(marker);
    }

    function callService( map, place, pos) {
        var query = searchInput.value || fallbackQuery;
        var service = new google.maps.places.PlacesService(map);
        service.textSearch({
            location: pos,
            radius: 1000,
            query: query
        }, callback);
    }

    return map;
}

$.getScript("https://maps.googleapis.com/maps/api/js?key=AIzaSyC-z2wEoAvxE66SgiLPnXosuzq3Tl_O-2s&libraries=places", function () {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            initMaps(pos);
        }, function() {
            apiGetLocation();
        });
    } else {
        apiGetLocation();
    }

    function apiGetLocation() {
        $.getJSON("http://www.geoplugin.net/json.gp?jsoncallback=?",
            function (data) {
                var pos = {
                    lat: parseFloat(data.geoplugin_latitude),
                    lng: parseFloat(data.geoplugin_longitude)
                };

                initMaps(pos);
            }
        );
    }

    function initMaps(pos){
        if (!pos){
            alert('We can\'t detect your location! Map function will be disabled!')
        }
        else {
            initPlacesMap('map-doctor', 'see-a-doctor', pos, 'Doctors');
            initPlacesMap('map-repair', 'car-repair', pos, 'Car Repair');
        }
    }
});

// PDF generation
// ================
function fillRandomData() {
    $.each($('[placeholder]'), function (index, el) {
        var $input = $(el);
        if ($input.length && $input.attr('placeholder')){
            $input.val($input.attr('placeholder'))
        }
    })
}
function bodyRows() {
    var data = $('form').serializeArray();
    var body = [];
    $.each($('#accident-form .form-group'), function (index, el) {
        var information = [];
        $(this).find('input,textarea').each(function(index) {
            if ($(this).val()){
                information.push($(this).val())
            }
        });

        if (information.length){
            var label = $(this).find('label').clone().find('span');

            if (!label.length){
                label = $(this).parent().find('label').clone().find('span');
            }

            var labelText = label
                .remove()
                .end()
                .text();

            body.push({
                record: $.trim(labelText),
                information: information.join(', ')
            });
        }
    });
    return body;
}

function generatePdf(doSave) {
    var doc = new jsPDF();

    doc.setFontSize(22);
    doc.text('Car Accident Details', 14, 22);
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

    if (doSave)
        doc.save('Car Accident Details.pdf');
    else
        return doc;
}

$('#fillRandomData').click(function (e) {
    e.preventDefault();
    fillRandomData();
});

$('#generateFullPDF').click(function (e) {
    e.preventDefault();
    var $images = $('.panel-thumbnails').find('img');

    if ($images.length){
        var doc = generatePdf(false);

        $images.each(function (e) {
            doc.addPage();
            var imgRatio = this.naturalHeight / this.naturalWidth;
            var width = doc.internal.pageSize.width;
            var height = doc.internal.pageSize.width * imgRatio;

            doc.addImage($(this).attr('src'), 'PNG', 0, 0, width, height);
        });

        doc.save('Car Accident Details.pdf');
    }
    else{
        generatePdf(true);
    }
});

// Camera
// ================
var video = document.querySelector('.panel-video video');

$('.js-take-picture').click(function(e) {
    e.preventDefault();
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


// Additional
// ================

// Clone withness form-groups
var wintessBaseIndex = 1;
var formGroupId = '#witness-1';
var $formGroup = $(formGroupId);

function fillPlaceholder(index, $el){
    var $formGroupInput = $el.find('input');
    var $formGroupTextarea = $el.find('textarea');

    $formGroupInput.attr("placeholder", "witness' name " + index).val('');
    $formGroupTextarea.attr("placeholder", "witness' address " + index).val('');
}

fillPlaceholder(wintessBaseIndex, $formGroup);

$witnessClone.click(function (e) {
    e.preventDefault();
    wintessBaseIndex++;

    var newFormGroupId = 'witness-'+ wintessBaseIndex;
    var $newFormGroup = $formGroup.clone()
        .attr('id', newFormGroupId)
        .appendTo('#witness-group');

    fillPlaceholder(wintessBaseIndex, $newFormGroup);
});

// auto-hide dropdown
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
