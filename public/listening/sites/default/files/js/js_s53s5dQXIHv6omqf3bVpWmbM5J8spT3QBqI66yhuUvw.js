function hoverAudioSource () {
  $('.audio-source').hover(function() {
      $(this).addClass('active');
  }, function() {
      $(this).removeClass('active');
  });

  $('.audio-source').on('touchstart', function () {
    $(this).toggleClass('active');
  });
}
(function ($, Drupal) {
  Drupal.behaviors.ResultFront = {
    attach: function (context, settings) {
      function convert(input) {
        var parts = input.split(':'),
            hours = +parts[0],
            minutes = +parts[1],
            seconds = +parts[2];
        return (minutes * 60 + seconds).toFixed(2);
      }
      if(drupalSettings.test){
        fill_blank();
        drop_down();
        radio();
        checkbox();
        row_checkbox();
      }

      if ($('#drupal-modal').length) {
        $('#drupal-modal').once('handle_stop_player').on('shown.bs.modal', function (e) {
          if ($(".mejs__playpause-button.mejs__pause button").length) {
            $(".mejs__playpause-button.mejs__pause button").click();
          }

          if ($('#stopwatch').length) {
            $('#stopwatch').addClass('paused');
          }
        });

        $('#drupal-modal').once('continute_countdown').on('hidden.bs.modal', function (e) {
          if ($('#stopwatch').length) {
            $('#stopwatch').removeClass('paused');
          }
        });
      }

      hoverAudioSource();


      var interval;
      var click_play_save = false;
      var first_click_bt = false;
      // declare object for video
        var mediaElements = document.querySelectorAll('audio'), i, total = mediaElements.length;
        for (i = 0; i < total; i++) {
            new MediaElementPlayer(mediaElements[i], {
                pluginPath: 'build/',
                features: ['playpause', 'current', 'progress', 'duration', 'volume'],
                success: function (media) {
                  // Re init source for youtube
                  var cur_src = media.getSrc().trim();
                  if (cur_src.indexOf('youtube.com/watch') > -1) {
                    media.setSrc(cur_src);
                    media.load();
                    media.play();
                    setTimeout(function() {
                      media.pause();
                    }, 500);
                  }

                    $(".mejs__button.mejs__play button").on('click',function(){
                        if($(".mejs__playpause-button").hasClass("mejs__play")) {
                            $('#stopwatch').removeClass('paused');
                        }
                        var qid = $("input.get-qid").val();                        
                        //start to set audio time
                        var uid = drupalSettings.user.uid;
                        var audio_time = null;
                        if(!click_play_save){
                            audio_time = $(".timeaudio").val();
                            if (typeof audio_time !== "undefined") {
                                audio_time = audio_time.trim() + '|' + uid + '|' + qid;
                            }
                        }
                        if(!first_click_bt){
                            //start audio time
                            if(typeof qid!='undefined') {
                                clearInterval(interval);
                                interval = null;
                                initTimer(qid);
                            }
                            first_click_bt = true;
                        }
                        if(audio_time !== null && typeof audio_time !== "undefined") {
                            var array_audio = audio_time.split("|");
                            if( uid == array_audio[1] && qid == array_audio[2] ) {                            
                                audio_time = array_audio[0];                                                    
                                if(audio_time.length == 5){
                                    audio_time = "00:"+ audio_time;
                                }
                                audio_time = convert(audio_time); 
                                media.setCurrentTime(audio_time);
                            }
                            click_play_save = true;
                        }
                        setTimeout(function(){
                            $(".player-test .player-loading").hide();
                            $(".player-test .player-loading").html('<i class="fa fa-spinner fa-spin"></i> '+Drupal.t('Loading...'));
                        },1000);
                    });
                    $("a.listen-from-here").each(function () {
                        $(this).click(function (e) {
                            e.preventDefault();
                            var timeToGoAudio = "";
                            var data = $(this).attr('data');
                            if (data != '') {
                                timeToGoAudio = $(this).attr('data');
                                if($(this).attr('data').length == 5){
                                    timeToGoAudio = "00:"+ timeToGoAudio;
                                }
                                timeToGoAudio = convert(timeToGoAudio);
                                media.play();
                                media.setCurrentTime(timeToGoAudio);
                                //media.setCurrentRail();
                                media.play();
                                setTimeout(function(){
                                    $(".player-test .player-loading").hide();
                                    $(".player-test .player-loading").html('<i class="fa fa-spinner fa-spin"></i> '+Drupal.t('Loading...'));
                                },1000);
                            }
                            //end audio time
                            var qid = $("input.get-qid").val();
                            if(typeof qid!='undefined') {
                                if (!interval) {
                                    initTimer(qid);
                                }
                            }
                        });
                    });
                    $(".playback").click(function(){
                        var time = media.getCurrentTime();
                        var timeback = time - 5;
                        if(timeback >= 0){
                            media.setCurrentTime(timeback);
                            media.play();
                        }
                    });
                    $(".playforward").click(function(){
                        var time = media.getCurrentTime();
                        var timefor = time + 5;
                        var duration = media.getDuration();
                        if(timefor <= duration){
                            media.setCurrentTime(timefor);
                            media.play();
                        }
                    });

                    $(".cs-dropdown p").on('click touchstart',function(){
                        $(this).parents('.audio-source').removeClass('active');
                        $(".cs-dropdown p").removeClass('active');
                        $(this).addClass('active');
                        media.setSrc($(this).attr('data-src').replace('&amp;', '&'));
                        media.load();
                        $(".player-test .player-loading").hide();
                        media.play();
                        var qid = $("input.get-qid").val();
                        if(typeof qid!='undefined') {
                            if (!interval) {
                                initTimer(qid);
                            }
                        }
                    });
                }
            });
        }
        function getCookie(name) {
            var nameEQ = name + "=";
            var ca = document.cookie.split(';');
            for(var i=0;i < ca.length;i++) {
                var c = ca[i];
                while (c.charAt(0)==' ') c = c.substring(1,c.length);
                if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
            }
            return null;
        }
        function initTimer(quiz_id) {
            var taketest = getCookie('taketest');
            var storage = JSON.parse(localStorage.getItem('time_'+quiz_id+taketest));
            var min = $(".innertimmer").val();
            var sec = 0;
            if(min.indexOf(":") > 0){
                var res = min.split(":");
                min = res[0];
                var second = res[1]/60;
                min = Number(min)+Number(second);
            }else{
                if(min <= 0){
                    min = 40;
                }
            }
            if(findGetParameter('draft') || findGetParameter('submit')) {
                if (storage !== null) {
                    min = storage.min;
                    sec = storage.sec;
                }
            }


            // var countDownDate = new Date().getTime() + ((min*60 + sec)*1000) + 1000;
            var countDownDate = (min*60 + sec);
            var now = 0;
// Update the count down every 1 second
            interval = setInterval(function() {
              // Pause count down for login user
              if ($('#stopwatch').hasClass('paused')) {
                /*var now = new Date().getTime();

                // Find the distance between now an the count down date
                var distance = countDownDate - now;

                // Time calculations for days, hours, minutes and seconds
                var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                var seconds = Math.floor((distance % (1000 * 60)) / 1000);
                if (seconds < 10) {
                  seconds = '0' + seconds;
                }

                // Output the result in an element with id="demo"
                document.getElementById("stopwatch").innerHTML = minutes + ":" + seconds;*/
                if (taketest) {
                  var distance = countDownDate - now;
                  var minutes = Math.floor((distance % (60 * 60)) / 60);
                  var seconds = Math.floor(distance % 60);// console.log(minutes, seconds, distance);
                  if (seconds < 10) {
                    seconds = '0' + seconds;
                  }
                  var store = {'min': minutes, 'sec': seconds};
                  console.log(store)
                  localStorage.setItem('time_' + quiz_id + taketest, JSON.stringify(store));
                }
              } else {
                // Get todays date and time
                // var now = new Date().getTime();
                now ++;

                // Find the distance between now an the count down date
                var distance = countDownDate - now;
                // console.log(distance);

                // Time calculations for days, hours, minutes and seconds
                var minutes = Math.floor((distance % (60 * 60)) / 60);
                var seconds = Math.floor(distance % 60);
                // console.log(minutes, seconds, distance);
                if (seconds < 10) {
                  seconds = '0' + seconds;
                }

                // Output the result in an element with id="demo"
                document.getElementById("stopwatch").innerHTML =  minutes + ":" + seconds;

                // If the count down is over, write some text
                if (distance < 0) {
                    clearInterval(interval);
                    document.getElementById("stopwatch").innerHTML = "00:00";
                    $('#modal-expired').modal('show');
                }
                if(seconds % 2 == 0){
                    if(taketest){
                        var store = {'min':minutes,'sec':seconds};
                        localStorage.setItem('time_'+quiz_id+taketest,JSON.stringify(store));
                        //start store audio time
                        var uid = drupalSettings.user.uid;
                        var audio_time = $('.mejs__currenttime').text();
                        audio_time = audio_time + '|' + uid + '|' + quiz_id;
                        localStorage.setItem('audio_time_'+quiz_id,audio_time);
                    }
                }
              }
            }, 1000);
        }
      $("a.facebook-share").each(function(){
        $(this).click(function(e){
          e.preventDefault();
          $("a.a2a_button_facebook").click();
        });
      });
      $("a.twitter-share").each(function(){
        $(this).click(function(e){
          e.preventDefault();
          $("a.a2a_button_twitter").click();
        });
      });
      $("a.google-share").each(function(){
        $(this).click(function(e){
          e.preventDefault();
          $("a.a2a_button_google_plus").click();
        });
      });

      $("a.share-test-action").mouseover(function (e) {
        $(".share-test").fadeIn("slow");
      });
      $("a.share-test-action").mouseleave(function (e) {
        setTimeout(function(){
          $(".share-test").fadeOut("slow");
        },3000)

      });
      $(".share-test").mouseover(function (e) {
        $(this).show();
      });
      $(".share-test").mouseleave(function (e) {
        setTimeout(function(){
          $(".share-test").fadeOut("slow");
        },3000)
      });

      //chnge source
      //   $(".change-source em").on('click',function(){
      //       if($(this).hasClass('show')){
      //           $(".cs-dropdown").fadeOut('slow');
      //       }else{
      //           $(".cs-dropdown").fadeIn('slow');
      //           $(this).addClass('show');
      //       }
      //   });
        function findGetParameter(parameterName) {
            var result = null,
                tmp = [];
            location.search
                .substr(1)
                .split("#")
                .forEach(function (item) {
                    tmp = item.split("=");
                    if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
                });
            return result;
        }
      function fill_blank() {
        var type_blank = $('.type_blank');
        type_blank.each(function () {
          var textInput = $(this).find('input[type="text"]');
          textInput.each(function () {
            var num = $(this).attr('data-num');
            var ans = drupalSettings.test[num].ans;
            $(this).val(ans);
          });
        })
      }
      function drop_down() {
        var type_drop = $('select[class="iot-question"]');
        type_drop.each(function (){
          var num = $(this).attr('data-num');
          var ans = drupalSettings.test[num].ans;
          $(this).val(ans);
        });
        //drag_drop selected
        var dropInputChoice = $(".drop_down").find('td[class="answer-wp"]');            
            dropInputChoice.each(function (){                
                var num = $(this).find('span').attr('rel');
                var ans = drupalSettings.test[num].ans;                
                $(this).find('span').text(ans); 
                $(this).find('span').removeClass('demo');
            });        
      }
      function radio() {
        var type_radio = $('.type_radio');
        type_radio.each(function (){
          var num = $(this).attr('data-num');
          var ans = drupalSettings.test[num].ans;
          if(ans){
            $('input[name="q-'+num+'"][value='+ans+']').attr('checked', true);
          }
        });
      }
      function checkbox() {
        var type_checkbox = $('.type_checkbox');
        type_checkbox.each(function (){
          var num = $(this).find('.iot-question').attr('data-num');
          var ans = drupalSettings.test[num].ans;
          if(ans){
              var ans_check = ans.split(' ');
              if(ans_check[0] != ""){
                  ans = ans.split(',')
                  for(var i =0; i<ans.length; i++){
                      if(ans[i].length>1){
                          ans[i] = ans[i][0];
                      }
                      $('input[name="q-'+num+'"][value='+ans[i]+']').attr('checked', true);
                      $(this).val(ans);
                  }
              }
          }
        });
      }
      function row_checkbox() {
        var type_row_checkbox = $('.type_row_checkbox');
        type_row_checkbox.each(function (){
          var num = $(this).attr('data-num');
          var ans = drupalSettings.test[num].ans;
         
          if(ans){
              var ans_check = ans.split(' ');
              if(ans_check[0] != ""){
                  ans = ans.split(',')
                  for(var i =0; i<ans.length; i++){
                      if(ans[i].length>1){
                          ans[i] = ans[i][0];
                      }
                       console.log($('input[name="q-'+num+'"][value='+ans[i]+']'));
                      $('input[name="q-'+num+'"][value='+ans[i]+']').attr('checked', true);
                      $('input[name="q-'+num+'"][value='+ans[i]+']').closest('td').addClass('active');
                      $(this).val(ans);
//                      console.log($(this).val(ans));
//                      console.log($('input[name="q-'+num+'"][value='+ans[i]+']'));
                  }
              }
          }
        });
      }
      
    function showMoreContent() {
        $('.solution-page .show-more').on('click', function(event) { 
            var parButton =  $(this).parent();          
            parButton.toggleClass('active');
            if (parButton.hasClass('active')) {
                $(this).html('+ Hide Now');
            }
            else {
                $(this).html('+ Show More');
            }
            $(this).closest('.tasks-content').toggleClass('active');
            $('html, body').animate({
                scrollTop: $(this).closest('.tasks-content').offset().top},
            700);
        });
    }
     
    showMoreContent();

      
    }
  }
})(jQuery, Drupal);
;
