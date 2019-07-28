(function ($, Drupal, drupalSettings) {
  Drupal.behaviors.iot_tour = {
    attach: function (context, settings) {

      if (settings.tour) {
        var tour_first = settings.tour.first;
        if (!$('#first-tour-screen').length) {
          $('body').append('<div id="first-tour-screen" class="first-tour-screen" style="display: none;">' +
            '<div class="content">' +
            '<h2 class="tour-tip-label" id="tour-tip-tour-page-label">' + tour_first[0].label + '</h2>' +
            '<div class="tour-tip-body">'+ tour_first[0].body +'</div>' +
            '<div class="tour-tip-action">' +
            '<a href="#" class="btn btn-primary start-tour">Take Tour</a>' +
            '<a href="#" class="btn btn-link dismiss">No Thanks</a>' +
            '</div>' +
            '</div>' +
            '</div>');

          $('#first-tour-screen').on('click', '.tour-tip-action .btn', function (e) {
            e.preventDefault();            
            $('#first-tour-screen').hide();
            localStorage.setItem('tour_visited' + settings.tour.id, true);
            if ($(this).hasClass('start-tour')) {
              var intro = introJs();
              $('#stopwatch').addClass('paused');
              intro.setOptions({
                steps: settings.tour.data,
                exitOnOverlayClick: false
              });
              intro.start();
              intro.oncomplete(function () {                    
                   $('#stopwatch').removeClass('paused');
                });

                intro.onexit(function () {
                   $('#stopwatch').removeClass('paused'); 
                });
              /*intro.oncomplete(function() {});*/
              intro.onbeforechange(function (targetElement) {
                if (!checkVisible(targetElement) && $(targetElement).closest('.split-left').length) {
                  $('#slpit-two').animate({
                    scrollTop: targetElement.offsetTop
                  },300, function () {
                    intro.refresh();
                  });
                }
              });

              var scrollEnd;
              $(window).on('scroll', function () {
                if (scrollEnd) clearTimeout(scrollEnd);
                scrollEnd = setTimeout(function () {
                  intro.refresh();
                }, 100);
              });
            }
            
            if ($(this).hasClass('dismiss')) {
                $('#stopwatch').removeClass('paused');
            }
            
          });
        }

        function checkVisible( elm, evalType ) {
          evalType = evalType || "visible";

          var vpH = $(window).height(), // Viewport Height
            st = $(window).scrollTop(), // Scroll Top
            y = $(elm).offset().top,
            elementHeight = $(elm).height();

          if (evalType === "visible") return ((y < (vpH + st)) && (y > (st - elementHeight)));
          if (evalType === "above") return ((y < (vpH + st)));
        }

        if ($('.reading-header .icon-instruction').length) {
          $('.reading-header .icon-instruction').parent().on('click', function (e) {
            e.preventDefault();
            if ($('#first-tour-screen').length) $('#first-tour-screen').show();
          });
        }

        //Show if first visit
        var tour_visited = localStorage.getItem('tour_visited' + settings.tour.id);
        if (tour_visited === null) {
          $('#first-tour-screen').show();
          $('#stopwatch').addClass('paused');
        }
      }

    }
  }
})(jQuery, Drupal, drupalSettings);
;
