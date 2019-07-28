(function ($, Drupal) {

    //Reading page
    function split_item() {
        setTimeout(function () {
            split.destroy();
            w = $(window).width();
            if (w < 768) {
                split = Split(['#slpit-one', '#slpit-two'], {
                    sizes: [50, 50],
                    minSize: 20,
                    direction: 'vertical',
                    onDrag: function () {
                        $(".split-item").getNiceScroll().resize();
                        $('.player-fixed').css("max-width", $('.split-right').outerWidth());
                    },
                });

            } else {
                split = Split(['#slpit-one', '#slpit-two'], {
                    sizes: [50, 50],
                    minSize: 20,
                    onDrag: function () {
                        $(".split-item").getNiceScroll().resize();
                        $('.player-fixed').css("max-width", $('.split-right').outerWidth());
                    },
                });
            }
        }, 500)
    }

    if ($('.api').length) {
        if (window.innerWidth <= 768) {
            var split = Split(['#slpit-one', '#slpit-two'], {
                sizes: [50, 50],
                minSize: 0,
                direction: 'vertical',
                onDrag: function () {
                    $(".split-item").getNiceScroll().resize();
                },


            });

        } else {
            var split = Split(['#slpit-one', '#slpit-two'], {
                sizes: [50, 50],
                minSize: 0,
                onDrag: function () {
                    $("#slpit-one").getNiceScroll().resize();
                    $("#slpit-two").getNiceScroll().resize();
                },


            });

        }
        setTimeout(function () {
            $("#slpit-one").getNiceScroll().resize();
            $("#slpit-two").getNiceScroll().resize();
        }, 400);
    }
    //split
    $(".split-item").niceScroll({
        autohidemode: 'false'
    });

    $('.qp-items').niceScroll({
        autohidemode: 'true'
    });

    $('.rf-button-pallete').click(function () {

        if ($('.question-panel').is(':visible')) {
            $('.question-panel').removeClass("show");

        } else {
            $('.question-panel').addClass("show");
            $('.qp-items').getNiceScroll().resize();

        }

    });

    $('.show-test-menu').click(function () {
        $('.reading-header').toggleClass("show-test");
        $('body').toggleClass("page-show-menu");
        if ($('.reading-header').hasClass("show-test")) {
            $(this).html(" <em></em> "+drupalSettings.hidetest);
        } else {
            $(this).html(" <em></em> "+drupalSettings.showtest);
        }
    });

    if ($('.api').length) {
        $('.player-fixed').css("max-width", $('.split-right').outerWidth());

        $('.sl-caption-bottom').css("max-width", $('.split-left').outerWidth());
        $(window).bind('resize', function() {

            setTimeout(function() {
                $('.sl-caption-bottom ').css("max-width", $('.split-left').outerWidth());
            }, 300);
            var width = window.innerWidth;
            var check = false;
            if (width <= 991) {
                check = true;

            } else {
                check = false;

            }
            if (check) {
                split.destroy();
                split = Split(['#slpit-one', '#slpit-two'], {
                    sizes: [50, 50],
                    minSize: 20,
                    direction: 'vertical',
                    onDrag: function() {
                        var splitWidth =  $('.sl-caption-bottom ').closest('.split-item').outerWidth();
                        $(".split-item").getNiceScroll().resize();
                        $('.player-fixed').css("max-width", $('.split-right').outerWidth());
                        $('.sl-caption-bottom ').css({
                            'width': splitWidth,
                            'max-width' : splitWidth
                        });
                    },
                });

            } else {
                split.destroy();
                split = Split(['#slpit-one', '#slpit-two'], {
                    sizes: [50, 50],
                    minSize: 20,
                    onDrag: function() {
                        var splitWidth =  $('.sl-caption-bottom ').closest('.split-item').outerWidth();
                        $(".split-item").getNiceScroll().resize();
                        $('.player-fixed').css("max-width", $('.split-right').outerWidth());
                        $('.sl-caption-bottom ').css({
                            'width': splitWidth,
                            'max-width' : splitWidth
                        });

                    },
                });

            }
        }).trigger('resize');

    }

    $(document).ready(function () {
        if (findGetParameter('submit')) {
            $('#modal-submit').modal('show');
        }
    });
    $(document).ready(function () {
        $(".essay-sample").click(function () {
            var filepath = $(this).attr("data-filepathsample");
            var filename = $(this).attr("data-filenamesample");
            var idfile = $(this).attr("data-idfile");
            var srciframe = $("#ifm-" + idfile).attr('src');
            $("#cv-ifm-" + idfile).html("");
            if(!srciframe){
                $.ajax({
                    url: '/get_url_pdf_essay_sample',
                    method: 'POST',
                    data: {filePath: filepath, fileName: filename},
                    success: function (res) {
                        if (res.status) {
                            $("#ifm-" + idfile).attr("src", res.data);
                            setTimeout(function(){
                                $("#ifm-" + idfile)[0].contentWindow.location.reload(true);
                            }, 100);
                        } else {
                            $("#cv-ifm-" + idfile).html("<p class='text-center'>File not found!</p>");
                        }
                    },
                    error: function (XMLHttpRequest, textStatus, errorThrown) {
                        console.log("Status: " + textStatus);
                        console.log("Error: " + errorThrown);
                    }
                });
            }

        })
    });
    function findGetParameter(parameterName) {
        var result = null,
            tmp = [];
        location.search
            .substr(1)
            .split("&")
            .forEach(function (item) {
                tmp = item.split("=");
                if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
            });
        return result;
    }

    function heroVideoBg() {
        var video_src = $('[drupal-selector="hero-video-bg"]').data('src');
        var windowWidth = parseFloat($(window).width());

        if (windowWidth > 767) {
            if (video_src && !$('#hero-video-bg').length) {
                $('.home-hero')
                    .prepend('<video playsinline="playsinline" autoplay="autoplay" muted="muted" loop="loop" class="hidden-xs" id="hero-video-bg">' +
                        '<source src="' + video_src + '" type="video/mp4">' +
                        '</video>');
            }
        }

        if (windowWidth <= 767) {
            $('.home-hero video').remove();
        }
    }

    var changeLanguage = false, load_notifications = false;

    Drupal.behaviors.iot_theme = {
        attach: function (context, settings) {

            //Build profile
            if ($('.dropdown-submenu > a').length) {
                $('.dropdown-submenu > a').once('toggle_account_menu').on("click", function (e) {
                    $(this).parent().toggleClass('active');
                    $(this).next('ul').finish().slideToggle();
                    e.stopPropagation();
                    e.preventDefault();
                });
                $('.user-info-wrap').mouseleave(function (event) {
                    $(this).find('.dropdown-submenu').removeClass('active');
                    $(this).find('.submenu-wp').finish().slideUp();
                });
            }

            //Add home hero video bg
            if ($('[drupal-selector="hero-video-bg"]').length && $('.home-hero')) {
                heroVideoBg();

                $(window).on('resize', function() {
                   heroVideoBg();
                });
            }

          function time_by_timezone(offset) {
            var d = new Date();
            var utc = d.getTime() + (d.getTimezoneOffset() * 60000);
            var nd = new Date(utc + (1000*offset));

            var h = '0' + nd.getHours();
            var m = '0' + nd.getMinutes();

            return h.slice(-2) + ':' + m.slice(-2);
          }

          //update user time real
          if ($('.time-zone').length) {
            var timezoneElm = $('.time-zone');
            var timezone = timezoneElm.data('timezone');
            var timezone_offset = timezoneElm.data('timezone-offset');

            if(timezone != '' && timezone_offset != '') {
              timezoneElm.text(time_by_timezone(timezone_offset) + ' (' + timezone + ')');

              setInterval(function () {
                timezoneElm.text(time_by_timezone(timezone_offset) + ' (' + timezone + ')');
              }, 59000);
            }
          }

            //Handle sot buynow btn
          if ($('[data-drupal-selector="sot-buynow-btn"]').length) {
            $('[data-drupal-selector="sot-buynow-btn"]').once('trigger_sot_buy_form').click(function () {
              if ($($(this).attr('href')).find('form').length) {
                $($(this).attr('href')).find('form').trigger('submit');
              }
            });
          }

            if ($('#iot-language-switcher').length) {
                if (settings.language !== undefined) {
                  $('#iot-language-switcher').val(settings.language);
                }
                $('#iot-language-switcher').on('change', function (e) {
                  e.preventDefault();
                  if (!changeLanguage) {
                    changeLanguage = true;
                    window.location.href = $(this).children('option[value="'+ this.value +'"]').data('href');
                  }
                });
            }

            //ViewerJS
            if ($('#fix-odt-file-load').length) {
                if (!$('#fix-odt-file-load').attr('src') && $('#fix-odt-file-load').data('src')) {
                  var src = $('#fix-odt-file-load').data('src');
                  $('#fix-odt-file-load').attr('src', src);
                }
                $(window).on('scroll', function (e) {
                  if ($(this).scrollTop() >= ($('#fix-odt-file-load').parent().offset().top - $(window).height()) && !$('#fix-odt-file-load').hasClass('loaded')) {                      
                    $('#fix-odt-file-load').addClass('loaded');
                  }
                });
            }
            //Get notifications
            if ($('.user-notification').length) {
                if (!load_notifications) {
                  load_notifications = true;
                  $.get(Drupal.url('account/notification-unread/'+ settings.user.uid +'?_format=json'))
                      .done(function (data) {
                        load_notifications = false;
                        var notification_cnt = 0;
                        var renderElm = $('ul.unread-notification');
                        renderElm.empty();
                        if (typeof data === 'string') data = JSON.parse(data);
                        for (var i in data) {
                          var notify = data[i];
                          var read_class = notify.unread === 0 ? 'not-seen' : '';
                          if(read_class == 'not-seen'){
                            notification_cnt ++;  
                          }
                          var tmp = '<li class="notify-item '+ read_class +'" data-notify="'+ notify.id +'">\n' +
                              ' <a href="'+ Drupal.url('account/notification/' + notify.id) +'">'+ notify.title +'</a><span class="date">' + notify.created + '</span>'
                              '</li>';
                          renderElm.append(tmp);
                          var unread_cnt = notify.unread_cnt;
                        }
                        if ($('.user-notification .number').length) {
                            if (unread_cnt > 0) {
                              $('.user-notification .number').html(unread_cnt);
                              if (unread_cnt > 99) {
                                $('.user-notification .icon-notification').addClass('plus');
                                $('.user-notification .number').html(99);
                              }
                            } else {
                              $('.user-notification .number').html('');
                              $('.user-notification .icon-notification').removeClass('plus');
                            }
                        }
                        
                        if ($('.user-notifications .icon-notification-mb .number').length && $('.user-notification .icon-notification .number').length) {
                            $('.user-notifications .icon-notification-mb .number').html($('.user-notification .icon-notification .number').html());
                        }
                        
                      });
                }
            }
        }
    }

    Drupal.behaviors.QuestionFront = {
        attach: function (context, settings) {

            //newsletter
            $('.our-test-item').matchHeight();
            $("form#subscriber-form").submit(function (e) {
                $("form#subscriber-form button").attr('disabled', true);
                var mail = $(".subscriber").val();
                if (mail == '') {
                    $(".error-message.newsletter-error").text('Email is required.');
                    return false;
                }
                if (!validateEmail(mail)) {
                    $(" .error-message.newsletter-error").text('Email is invalid.');
                    return false;
                }
                $.post('/subscriber/callback', {email: mail})

                    .done(function (data) {
                        if (data == 'ok') {
                            $("#modal-subscribe").modal('show');
                            $("form#subscriber-form button").attr('disabled', false);
                            $(".subscriber").val('');

                        }
                    });
                return false;
            });

            $('.rate-widget-fivestar a').hover(function () {
                $(this).addClass('hover');
                $(this).prevAll().addClass("hover");
                $(this).prevAll().removeClass("hover-fa-star-o");
                $(this).nextAll().removeClass("hover");
                $(this).nextAll().addClass("hover-fa-star-o");
            });
            $('.rate-widget-fivestar').mouseleave(function () {
                $(this).find(".hover").removeClass("hover");
                $(this).find(".hover-fa-star-o").removeClass("hover-fa-star-o");
            });

            $(".progress-state").each(function () {
                var per = $(this).attr('data');
                $(this).css('width', per);
            });

            if (window.location.href.indexOf("#academic") > -1) {
                $("#tab-click-3").click();
            }
            if (window.location.href.indexOf("#general-training") > -1) {
                $("#tab-click-4").click();
            }
            $("ul.menu-main li a").each(function () {

                $(this).click(function () {
                    if ($(".tab-test").length > 0 && $(this).attr('href').indexOf('#') > 0) {
                        $('html, body').animate({
                            scrollTop: $(".tab-test").offset().top - 100
                        }, 1000);
                        var href = $(this).attr('href');
                        if (href.indexOf("#general-training") > -1) {
                            $("#tab-click-4").click();
                        }
                        if (href.indexOf("#academic") > -1) {
                            $("#tab-click-3").click();
                        }
                    }
                });
            });
            $("a.explanation-click").each(function () {
                $(this).click(function (e) {
                    currentPosition = $("#slpit-one").scrollTop();
                    setTimeout(function () {
                        if ($(window).width() > 768) {
                            $(".split-item").getNiceScroll().resize();
                            $("#slpit-one").scrollTop(currentPosition);
                        }
                    }, 500);
                })
            });
            /**Preload**/
            $('#page-loader').delay(800).fadeOut(600, function () {
                $('body').fadeIn();

            });
            $("a.share-result").each(function () {
                $(this).click(function (e) {
                    e.preventDefault();
                    $("input.share-result").select();
                    document.execCommand("Copy");
                });
            });


            //mathHeight
            $('.book-item').matchHeight();
            //toggle mobile menu
            $('.nav-icon').on('touchstart tap', function () {
                $('#overlay-menu').toggleClass('active');
                $(this).toggleClass('open');
                $('body').toggleClass("open-menu");
            });
            $('#overlay-menu').on('click touchstart', function () {
                $(this).removeClass('active');
                $('.nav-icon').removeClass('open');
                $('body').removeClass("open-menu");
            });
            /**Menu**/


            $('.menu-res li.has-child > a').once('toggle_account_menu_mobile').on('click', function (event) {
                event.stopPropagation();
                var submenu = $(this).next();
                if ($(submenu).is(":visible")) {
                    $(submenu).slideUp();
                    $(this).removeClass("open-submenu-active");
                } else {
                    $(submenu).slideDown();
                    $(this).addClass("open-submenu-active");
                }
                return false;
            });

            $('.menu-res li.menu-item-has-children > a').on('click', function () {
                //  return false;
            });


            //listing page

            $('#qp-afix').affix({
                offset: {
                    top: 290,
                    bottom: function () {
                        return (this.bottom = $('.footer').outerHeight(true) + 100)
                    }
                }
            })

            //show-nodepad
            $('.btn-show-note').unbind().click(function (event) {
                event.preventDefault();
                var id = $(this).attr("data-target");
                if ($(this).hasClass("active")) {
                    $(id).slideUp();
                    $(this).removeClass("active");
                    $(this).html(" <strong></strong> "+drupalSettings.shownotepad);

                } else {
                    $(id).css('display', 'block');
                    $(id).slideDown();
                    $(this).addClass("active");
                    $(this).html(" <strong></strong> "+drupalSettings.hidenotepad);
                }
                if ($('.reading-box')[0]) {
                    split_item();
                }

            });

            //text-size
            $('.btn-textsize').click(function () {
                if ($(this).hasClass('btn-textsize-big')) {
                    $(this).removeClass('btn-textsize-big');
                    $('body').removeClass("text-big");
                } else {
                    $(this).addClass('btn-textsize-big');
                    $('body').addClass("text-big");
                    $('#slpit-one').attr('overflow-y', 'hidden');
                    $('#slpit-two').attr('overflow-y', 'hidden');
                }
            });


            //tips page


            var owl_tip = $('.owl-tip')
            $(owl_tip).owlCarousel({
                loop: true,
                margin: 0,
                nav: false,
                autoplay: true,
                autoplayTimeout: 8000,
                items: 1


            });

            //analytics page
            if ($('.datetimepicker').length) {
                $(function () {
                    $('.datetimepicker').datetimepicker({
                        format: 'DD/MM/YYYY'
                    });
                });
            }

            //show-performance
            $('.btn-show-performance').click(function () {


                if ($(this).parents(".item-score").find(".box-performance").is(":visible")) {
                    $(this).parents(".item-score").find(".box-performance").slideUp();
                    $(this).removeClass("active");

                } else {

                    $(this).parents(".item-score").find(".box-performance").slideDown();
                    $(this).addClass("active");
                }


            });
            //homepage
            var owl_say = $('.owl-say')
            $(owl_say).owlCarousel({
                loop: true,
                margin: 0,
                nav: false,
                autoplay: true,
                autoplayTimeout: 8000,
                responsive: {
                    0: {
                        items: 1,

                    },
                    768: {
                        items: 2,

                    },
                    1000: {
                        items: 3,

                    }
                }

            });
            $('.carousel').carousel({
                directionNav: false,
                buttonNav: 'bullets',
                slidesPerScroll: 5,
                top: 10,
                hMargin: 0.1,
                frontWidth: 500,
                autoplayInterval: 8000,
                description: true,
                pauseOnHover: true,
                descriptionContainer: '.description'
            });

            //set progesss
            var setProcess = function (id, number) {

                $(id).removeClass(function (index, className) {
                    return (className.match(/(^|\s)progress-\S+/g) || []).join(' ');
                });
                var newClass = "progress-" + number;
                $(id).addClass(newClass);

            };
            // setProcess("#progress-small", 75);
            // setProcess("#progress-big", 40);

            //show-re
            $('.btn-show-re').click(function () {
                $('body').addClass("show-review-explanation");
                $(".split-item").getNiceScroll().resize();
                $('.player-fixed').css("max-width", $('.split-right').outerWidth());
            });
            //close-re
            $('.close-rx').click(function () {
                $('body').removeClass("show-review-explanation");
            });

            //show - close pallete
            $('.rf-bar-pallete .pallete-title, #expand-pallete,.pbb-caption,.close-rf').click(function() {
                $('body').toggleClass('show-palette');
                $('.qp-items').getNiceScroll().resize();
            });
            //function to hidePalette
            function hidePalette() {
                $('.reading-page .reading-footer,.reading-page .sl-caption-bottom').css({
                    'transform': 'translateY(85px)',
                    'transition': 'all 0.5s ease-out'
                });
                setTimeout(function(){

                    $('.reading-page .reading-footer,.reading-page .sl-caption-bottom').css({
                        'transform': 'translateY(0)',
                        'transition': 'all 0s ease-out'
                    });
                    $('body').removeClass('show-palette');

                }, 400);
            }
            //set timeout to hidePalette

            function callHidePalette() {
                setTimeout(hidePalette, 5000);
            }
            callHidePalette();
            //tooltip hover boostrap custom
            $(".pop").popover({ trigger: "manual" , html: true, animation:false})
                .on("mouseenter", function () {
                    var _this = this;
                    $(this).popover("show");
                    $(".popover").on("mouseleave", function () {
                        $(_this).popover('hide');
                    });
                }).on("mouseleave", function () {
                var _this = this;
                setTimeout(function () {
                    if (!$(".popover:hover").length) {
                        $(_this).popover("hide");
                    }
                }, 0);
            });
            function changeFontSize () {
                var fonts = ["font-large", "font-medium", "font-small"];
                $.each(fonts, function (i, sector) {
                    $('a.'+sector).on("click", function (e) {
                        $('body').addClass(sector);
                        fonts.forEach(function(value){
                            if (value != sector)
                                $('body').removeClass(value);
                        });
                        $('#overlay-menu').toggleClass('active');
                        // $('.nav-icon').toggleClass('open');
                        // $('body').toggleClass("open-menu");
                        $('.text-font-size').stop( true, true ).slideUp();
                    });
                    $('div.'+sector).on("click", function (e) {
                        $('body').addClass(sector);
                        fonts.forEach(function(value){
                            if (value != sector)
                                $('body').removeClass(value);
                        });
                    });
                })
            }
            changeFontSize();
            //build-pofile
            $('.pb-choose span').click(function () {

                $('.pb-choose span').removeClass("active");
                $(this).addClass("active");
                $('.bo-im span').html($(this).text());
            });
            $('.menu-reading .font-size').hover(function() {
                $('.text-font-size').stop( true, true ).slideDown();
            }, function() {
                $('.text-font-size').stop( true, true ).slideUp();
            });
            $('.step2-choose').click(function () {

                var current = $(this).next(".ts2-item-wrap");
                $('.ts2-item-wrap').not(current).slideUp();
                if ($(this).next(".ts2-item-wrap").is(":visible")) {

                } else {
                    $(this).next('.ts2-item-wrap').slideDown();
                }
                $('.step2-choose').removeClass("active");
                $(this).addClass("active");
            });

            function validateEmail(email) {
                var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                return re.test(email.toLowerCase());
            }

            function listCookies() {
                var theCookies = document.cookie.split(';');
                var aString = '';
                for (var i = 1; i <= theCookies.length; i++) {
                    aString += i + ' ' + theCookies[i - 1] + "\n";
                }
                return aString;
            }

            // console.log(listCookies());

            $("a.btn-continute").click(function (e) {
                e.preventDefault();
                $(".close-modal").click();
            });

        }
    }

    Drupal.behaviors.CheckoutPane = {
        attach: function (context, settings) {

            if ($('fieldset[data-drupal-selector="edit-payment-information-payment-method"] div.form-item-payment-information-payment-method').length > 2) {
                $('fieldset[data-drupal-selector="edit-payment-information-payment-method"] div.form-item-payment-information-payment-method:first-child').hide();
            }

            //  $('fieldset[data-drupal-selector="edit-payment-information-payment-method"] input[value="new--credit_card--authoriz_js"]').attr('checked',true);
            $('fieldset[data-drupal-selector="edit-payment-information-payment-method"] input.payment-method--stored').each(function () {
                if ($(this).attr('checked') == 'checked') {
                    $('fieldset[data-drupal-selector="edit-payment-information-payment-method"] input[value="new--credit_card--authoriz_js"]').click();
                }
            });

            $('fieldset[data-drupal-selector="edit-payment-information-payment-method"] input.payment-method--stored').each(function () {
                $(this).parent().parent().hide();
            });

            $(Drupal.t('<h2 class="include-name">Payment Details</h2>')).insertBefore('#payment-errors');
            $(Drupal.t('<h2 class="include-name">Billing Address</h2>')).insertBefore('.field--type-address');

            if ($('.view-commerce-checkout-order-summary td[headers="view-title-table-column"]').length > 0) {
                var str = $('.view-commerce-checkout-order-summary td[headers="view-title-table-column"]').html();
                str.replace("_", "-");
                var val = $('.view-commerce-checkout-order-summary td[headers="view-title-table-column"]').html();
                $('.view-commerce-checkout-order-summary td[headers="view-title-table-column"]').html(val.replace('_', '-'));
            }

            // $('#payment-information-wrapper .panel-heading .panel-title').text(Drupal.t('Order Information'));
            // $('#payment-information-wrapper fieldset[data-drupal-selector="edit-payment-information-payment-method"] .fieldset-legend').text(Drupal.t('Select Payment Method'));

            $('fieldset[data-drupal-selector="edit-payment-information-payment-method"] input[value="new--credit_card--authoriz_js"]').parent().addClass('credit-card-label');
            // $('fieldset[data-drupal-selector="edit-payment-information-payment-method"] input[value="new--credit_card--authoriz_js"]').parent().text(Drupal.t('Debit/ Credit Card'));
            // var card = $('fieldset[data-drupal-selector="edit-payment-information-payment-method"] input[value="new--credit_card--authoriz_js"]').parent().html();
            //  card.replace("New credit card", Drupal.t('Debit/ Credit Card'));
            // var rpl = $('fieldset[data-drupal-selector="edit-payment-information-payment-method"] input[value="new--credit_card--authoriz_js"]').parent().html();
            //  $('fieldset[data-drupal-selector="edit-payment-information-payment-method"] input[value="new--credit_card--authoriz_js"]').parent().html(rpl.replace("New credit card", Drupal.t('Debit/ Credit Card')));
            $('fieldset[data-drupal-selector="edit-payment-information-payment-method"] input[value="new--credit_card--authoriz_js"]:checked').parent().addClass('credit-card-label active');
            $('fieldset[data-drupal-selector="edit-payment-information-payment-method"] input[value="paypal"]').parent().addClass('paypal-label');
            $('fieldset[data-drupal-selector="edit-payment-information-payment-method"] input[value="paypal"]:checked').parent().addClass('paypal-label active');
            $('.checkout-pane-completion-message').prev().remove();
            $('.checkout-pane-completion-message').prev().remove();
            // $('fieldset[data-drupal-selector="edit-payment-information-payment-method"] input[value="new--credit_card--authoriz_js"]:after').text(Drupal.t('Debit/ Credit Card'));

            //  console.log(str);

            //validate card
            if( $('div[data-drupal-selector="edit-actions"]').length > 0){
                $('div[data-drupal-selector="edit-actions"]').once('add_preload-1').append('<img class="preload-1" src="/themes/iot/images/preloader.gif" width="50" height="50">');
            }
            $('form.commerce-checkout-flow-multistep-default').submit(function () {
                $('img.preload-1').each(function(e){
                    if(e==0){
                        $(this).show();
                    }
                });
                $('div[data-drupal-selector="edit-actions"] button').attr('disabled', 'disabled');
            });


            /*function testnum(val){
             var isnum = /^\d+$/.test(val);
             var num = false;
             if(isnum){
             num = true;
             }
             return num;
             }*/
        }
    }

    //Writing Evaluation FAQ
    $('.accordion .item .heading').click(function () {
        var a = $(this).closest('.item');
        var b = $(a).hasClass('open');
        var c = $(a).closest('.accordion').find('.open');
        if (b != true) {
            $(c).find('.content').slideUp(200);
            $(c).removeClass('open');
        }
        $(a).toggleClass('open');
        $(a).find('.content').slideToggle(200);
    });
    //do something when user click login and register
    $(document).on('click', '.link-popup-login', function () {
        //close register popup
        $('#modal-register-pop').modal('hide');
        //set submit
        var submit = $(this).attr("data-submittest");
        var destination = $("#user-login .destination").val();
        var arr_des = destination.split("?");
        if(arr_des.length > 1){
            destination = arr_des[0];
        }
        $('.social-login-form').attr('action', '/account/login?destination=' + destination);
        if (typeof submit !== "undefined") {
            if(submit == 'submit'){
                $(".submit-test").val('true');
            }else{
                $(".submit-test").val('');
            }
            $("#user-login .destination").val(destination + '?' + submit + '=true');
            $(".social-login-form input[name=destination]").val(destination + '?' + submit + '=true');
            $('.social-login-form').attr('action', '/account/login?destination=' + destination + '&' + submit + '=true');
        }
        $('#stopwatch').addClass('paused');
        $(".mejs__playpause-button button").click();
        
    });
    $(document).on('click', '.link-popup-register', function () {
        //close login popup
        $("#modal-login-pop").modal('hide');
        //set submit
        var submit = $(".link-popup-login").attr("data-submittest");
        if (typeof submit !== "undefined") {
            var destination = $("#user-login .destination").val();
            $("#user-register .destination").val(destination);
        }
    });
    //js for writing collection page
    $.fn.clickOff = function(callback, selfDestroy) {
        var clicked = false;
        var parent = this;
        var destroy = selfDestroy || true;

        parent.click(function() {
            clicked = true;
        });

        $(document).click(function(event) {
            if (!clicked) {
                callback(parent, event);
            }
            if (destroy) {
                //parent.off("click");
            };
            clicked = false;
        });
    };
    $(document).ready(function () {
        var ckbox = $('#ielts-modules .dropdown label').find('input');
        if (ckbox.is(':checked')) {
            $('#test-collections').addClass('selected');
        }
    });
    //add elements to filter
    $(document).on('click', '.btn-filter-col', function() {
        var ids = $('input[name="test-collect[]"]').serializeArray();
        var arr_id_col = [];
        ids.forEach(function(value){
            arr_id_col.push(value.value);
        });
        var ids_cate = $('input[class="checkbox-cate[]"]').serializeArray();
        var arr_id_cate = [];
        ids_cate.forEach(function(value){
            arr_id_cate.push(value.value);
        });
        var url_redirect = "/writing-test-collection";
        if(arr_id_col.length > 0){
            var id_temp = arr_id_col[arr_id_col.length - 1];
            window.location.href = url_redirect+"?field_collection_target_id="+id_temp+"&idcollection="+arr_id_col.toString()+"&idcate="+arr_id_cate.toString();
        }else{
            if(arr_id_cate.length > 0){
                window.location.href = url_redirect+"?idcate="+arr_id_cate.toString();
            }else{
                window.location.href = url_redirect;
            }
        }
    });
    if($(".filter-section").length > 0 ){
        $(".filter-section").clickOff(function() {
            $(".filter-section").find('.filter-menu').removeClass('active');
            $('#overlay-region, .filter-section').removeClass('active');

        });
    }
    //Function to check content filter
    function checkContentFilter(){
        if($('.desktop-filter a').length > 0){
            $('.desktop-filter').show();
            $('body').addClass('showing-filter');
        }else{
            $('#test-collections').removeClass('selected');
            $('.desktop-filter').hide();
            $('body').removeClass('showing-filter');
        }
    }
    //filter-dropdown
    $('.filter-title-wrap').click(function(event) {
        $('#overlay-region').addClass('active');
        $(this).parents('.filter-section').addClass('active');
        $(this).parent().toggleClass('active');
        // $(this).parent().siblings().removeClass('active');
        if (!$(this).parent().hasClass('active') && !$(this).parent().siblings('.filter-menu').hasClass('active')) {
            $('#overlay-region').removeClass('active');
            $(this).parents('.filter-section').removeClass('active');
        } else {
            $(this).parents('.filter-section').removeClass('active');
        }
    });

    //add elements to filter
    $(document).on('click', '.dropdown label', function(event) {
        var inputChild = $(this).children('input');
        var indexParent = $(this).parent().index();
        var indexDropdown = $(this).parents('.filter-menu').attr('tabindex');
        var currentFilter = $(this).text();
        var parentClass = $(this).parents('li').attr('class');
        if(inputChild.is(':checked')){
            inputChild.prop("checked", false);
            $(".items-box .element-"+inputChild.val()).remove();
        }
        else{
            $(this).addClass('element-'+ inputChild.val());
            inputChild.prop("checked", true);
            $('.items-box').append(' <a href="javascript:;" class="tag-item  tag-item-bg '+ parentClass +' element-'+ inputChild.val() +'">'+ currentFilter +' <img alt="" src="/themes/iot/images/close_icon.png" class="tagclose"></a>');
        }
        event.preventDefault();
        checkContentFilter();
    });
    // active test collections dropdown;
    $(document).on('click', '#ielts-modules .dropdown label', function(event) {
        var ckbox = $(this).find('input');
        var ckboxClass = $(this).find('input').attr("name");
        var allCheckbox = $('#ielts-modules input');
        if (ckbox.is(':checked')) {
            $.ajax({
                url: '/get_collection_by_cate',
                method: 'POST',
                data: {idCate: ckbox.val()},
                success: function(res){
                    $('#test-collections .dropdown').append(res.data);
                }
            });
            $('#test-collections').addClass('active selected');
        } else if ( ! ckbox.is(':checked') && allCheckbox.is(':checked')) {
            $('#test-collections .dropdown').find('.'+ckboxClass).remove();
            $('.items-box').find('.'+ckboxClass).remove();
            checkContentFilter();
            // return;
        }
        else {
            $('#test-collections .dropdown').find('.'+ckboxClass).remove();
            $('#test-collections').removeClass('active selected');
            $('.items-box').find('.'+ckboxClass).remove();
            checkContentFilter();
        }
    });

    //Remove filter item on click buton
    $(document).on('click', '.tag-item', function(event) {
        event.preventDefault();
        if($(this).hasClass('parent'))
        {
            var classItem = $(this).attr('class');
            var patt = /checkbox\d{1,3}/g;
            var result = patt.exec(classItem).toString();
            $('.items-box').find('.'+result).remove();
            $('.filter-section .dropdown').find('.'+result+' input').prop("checked", false);
            $('#test-collections .dropdown').find('.'+result).remove();
            $(this).remove();

        }else{
            var classItem = $(this).attr('class');
            var patt = /element-\d{2,8}/g;
            var result = patt.exec(classItem).toString();
            $('.filter-section .dropdown').find('.'+result+' input').prop("checked", false);
            $(this).remove();
        }

        checkContentFilter();
    });

    // mobile filter
    $("#mob-filter-btn").click(function() {
        $("body").addClass('filtering');
    });

    $("#filter-close, .filter-close-bt, .filter-apply").click(function() {
        $("body").removeClass('filtering');
        $('#overlay-region,.filter-section, .filter-menu').removeClass('active');
    });
    //disable unnecessary item in product-variation tab
    $(document).ready(function() {
        $(".product-variation .nav li.disabled a").click(function() {
            return false;
        });
    });

    //check currency change
    $("select.currency-selectpicker").on('change',function(){
        var curr = $(this).val();
        var loged_user = $(this).attr('data-user');
        if(loged_user==1){
            $.ajax({
                url: "/update/currency/" + curr, success: function (result) {
                    if (result == 'ok') {
                        window.location.reload();
                    }
                }
            });
        }else{
            setCookieCurrency('global_currency', curr, 1);
            window.location.reload();
        }

    });

    function setCookieCurrency(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        var expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }

})(jQuery, Drupal);
;
