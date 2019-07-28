(function ($,Drupal,drupalSettings) {

        var qid = $("input.get-qid").val();
        var uid = drupalSettings.user.uid;
        update_result_review();
        if(typeof qid!='undefined'){
            if(!findGetParameter('draft') && !findGetParameter('submit') && !findGetParameter('forget')){
                eraseCookie('taketest');
            }
            var qtype = $("input.question-type").val();
            storeLocal(qid);
            
            if(qtype == 'reading'){
                //if( uid > 0 ) {
                    initTimer(qid);
                //}    
                
            }
            $(".qp-item").click(function (){                
                var id = $(this).attr('data-q');
                var des = $("#"+id);
                $('html, body').animate({
                    scrollTop: des.offset().top-100
                }, 200);
                des.focus();
                if ($('.question-panel').is(':visible')) {
                    $('.question-panel').removeClass("show");

                } else {
                    $('.question-panel').addClass("show");
                    $('.qp-items').getNiceScroll().resize();

                }
            });
        }
        if(findGetParameter('draft')){
            eraseCookie('taketest');
            submit(0,qid);
        }
        $('.save-to-draft').each(function(){
         $(this).click(function(e) {
             e.preventDefault();
             eraseCookie('taketest');
             submit(0,qid);
             $('#stopwatch').addClass('paused');             
         });

        });
        // focus to question ư
        //
        var issubmittest = false;
        $('.submit-test-block').click(function(){
            if(!issubmittest){
                eraseCookie('taketest');
                submit(1,qid);
                issubmittest = true;
                $('.submit-test-block').addClass("disable-submit-test");
                $(this).find('span').hide();
                if ($('.md-submit-bt i').length == 0 )
                {
                    $(this).prepend('<i class="fa fa-spinner fa-spin"></i>')
                }
                else return;
            }
        });
        //stop audio and timer when user click submit
        $('.submit-btn-test').click(function () {            
            $('#stopwatch').addClass('paused');
            if($(".mejs__playpause-button").hasClass("mejs__pause")){
                $(".mejs__playpause-button button").click();
            }
            var qtype = $("input.question-type").val();
            if(qtype == 'reading'){
                $('#stopwatch').addClass('paused');
            }
                        
            //add flag to forget password
            var des = $(".destination_encode").val();
            var _href = $("#forget-pass").attr("href");            
            $('#forget-pass').attr("href", _href + "?p="+des);
            //set localstorage for redirect after registration.
            var after_register_dest = $(".destination").val();
            localStorage.setItem("after_register_dest", after_register_dest);            
        });

        //start audio and timer when user click cancel
        $('.btn-start-time-audio').click(function () {
            if($(".mejs__playpause-button").hasClass("mejs__play")){;
                $('#stopwatch').removeClass('paused');
                $(".mejs__playpause-button button").click();
            }
            var qtype = $("input.question-type").val();
            if(qtype == 'reading'){
                $('#stopwatch').removeClass('paused');
            }
        });

        $('.exit-the-test').click(function (e) {
            e.preventDefault();
            $('#modal-exit-test').modal('show');
            $('#stopwatch').addClass('paused');
        });
        $('.exit-test-solution').click(function (e) {
            e.preventDefault();
            $('#modal-exit-test-solution').modal('show');
        });

    function submit(status,qid) {
        data = getData();
        var totalAns = 0;
        for (var key in data.answers) {
            if (data.answers[key].num.indexOf("-") >= 0) {
                if (data.answers[key].ans.length > 0) {
                    var exp = data.answers[key].num.split("-");
                    totalAns += exp[1] - exp[0] + 1;
                }
            } else {
                if (data.answers[key].ans) {
                    totalAns++;
                }
            }
        }
        var storage = JSON.parse(localStorage.getItem('time_'+qid));
        var time = $('#stopwatch').text();
        if(storage !== null){
            time = storage;
        }
        var qtype = $("input.question-type").val();
        var audio_time = '00:00';
        if(qtype == 'listening'){
            var audio_time_storage = localStorage.getItem('audio_time_'+qid);
            audio_time = $('.mejs__currenttime').text();
            if(audio_time_storage !== null && audio_time.trim() === "00:00"){
                var array_audio = audio_time_storage.split("|");
                if(array_audio.length > 0){
                    audio_time = array_audio[0];
                }
            }
            if(status == 0){
                $('.innertimmer').val(time);
                $('.timeaudio').val(audio_time);
            }
        }
        solv =  drupalSettings.answers;
        language = drupalSettings.language;
        result = takeTest(solv,data);
        total = solv.total;
        sid = solv.sec_id;
        score_id = drupalSettings.score;
        package = [
            total,result,data,score_id,time,status,qid,totalAns,audio_time
        ];
        // localStorage.clear();
        localStorage.removeItem('time_' + qid);
        localStorage.removeItem('audio_time_'+qid);
        localStorage.removeItem(getCookie('taketest'));
        setCookie('taketest','',30);
        eraseCookie('taketest');
        getCsrfToken(function (csrfToken) {
            postNode(csrfToken, package,status,language);
        });
    }
    function takeTest(solv,data) {
        var score = 0;
        for(var key in solv.answers){
            switch (solv.answers[key].type){
                case 'blank':
                    for(var i=0;i<solv.answers[key].answer.length;i++){
                        var str1 = solv.answers[key].answer[i].toString().toLowerCase();
                        var str2 = data.answers[key].ans.toString().toLowerCase();
                        dostr = str1.replace(/[^a-zA-Z0-9]/g, '');
                        ansstr = str2.replace(/[^a-zA-Z0-9]/g, '');
                        if(dostr===ansstr){
                            score++;
                            data.answers[key].correct = 1;
                            break;
                        }
                    }
                    break;
                case 'radio':
                    if(solv.answers[key].answer && data.answers[key].ans){
                        if(solv.answers[key].answer.trim() == data.answers[key].ans.trim()){
                            score++;
                            data.answers[key].correct = 1;
                        }
                    }

                    break;
                case 'drop_down':
                    if(solv.answers[key].answer == data.answers[key].ans){
                        score++;
                        data.answers[key].correct = 1;
                    }
                    break;
                case 'checkbox':
                    if (solv.answers[key].number.indexOf("-") >= 0) {
                        if (data.answers[key].ans.length > 0 && data.answers[key].ans.length <= solv.answers[key].answer.length) {
                            for (i = 0; i < solv.answers[key].answer.length; i++) {
                                for (j = 0; j < data.answers[key].ans.length; j++) {
                                    if (data.answers[key].ans[j] && solv.answers[key].answer[i]) {
                                        if (data.answers[key].ans[j].trim() == solv.answers[key].answer[i].trim()) {
                                            score++;
                                            data.answers[key].correct = 1;
                                        }
                                    }
                                }
                            }
                        }
                    } else {
                        var count = 0;
                        if(solv.answers[key].answer.length == data.answers[key].ans.length){
                            for (i = 0; i < solv.answers[key].answer.length; i++) {
                                for (j = 0; j < data.answers[key].ans.length; j++) {
                                    if (data.answers[key].ans[j] && solv.answers[key].answer[i]) {
                                        if (data.answers[key].ans[j].trim() == solv.answers[key].answer[i].trim()) {
                                            count++;
                                        }
                                    }
                                }
                            }
                        }
                        if (count == solv.answers[key].answer.length) {
                            score++;
                            data.answers[key].correct = 1;
                        }
                    }
                    break;
            }
        }

        return score;
    }
    function getData() {
        var sid = $("input.get-qid").val();
        var data = {'sec_id':sid,'answers':{}};
        var type_blank = $('.type_blank');
        type_blank.each(function (){
            var textInput = $(this).find('input[type="text"]');
            textInput.each(function () {
                var num = $(this).attr('data-num');
                var type = $(this).attr('data-q_type');
                var ans = $(this).val();
                data.answers[num] = {'num':num,'type':type,'ans':ans};
            });
        });
        var type_drop = $('.drop_down');
        type_drop.each(function (){
            var dropInput = $(this).find('select[class="iot-question"]');
            dropInput.each(function (){
                var num = $(this).attr('data-num');
                var type = $(this).attr('data-q_type');
                var ans = $('#q-'+num+' option:selected').val();
                data.answers[num] = {'num':num,'type':type,'ans':ans};
            });
        });
        var type_radio = $('.type_radio');
        type_radio.each(function (){
            var num = $(this).attr('data-num');
            var type = $(this).attr('data-q_type');
            var ans = $(this).find('input[name="q-'+num+'"]:checked').val();
            data.answers[num] = {'num':num,'type':type,'ans':ans};
        });
        var type_checkbox = $('.type_checkbox');
        type_checkbox.each(function (){
            var num = $(this).find('.iot-question').attr('data-num');
            var type = $(this).find('.iot-question').attr('data-q_type');
            var ans = $(this).find('input[name="q-'+num+'"]:checked').map(function(){
                return this.value; }).get();
            data.answers[num] = {'num':num,'type':type,'ans':ans};
        });
        return data;
    }
    function getCsrfToken(callback) {
        $.get(Drupal.url('rest/session/token'))
            .done(function (data) {
                var csrfToken = data;
                callback(csrfToken);
            });
    }
    function postNode(csrfToken, node,status, language) {
        var lang = '';
        if(language!='en'){
            lang = '/'+language;
        }
        //console.log(lang);

        $.ajax({
            url: lang+'/api/store-result?_format=json',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken
            },
            data: JSON.stringify(node),
            success: function (node) {
                if(status==1){
                    window.location.pathname = lang+node;
                }
                if(status==0){
                    $('#modal-draft').modal('show');
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                console.log("Status: " + textStatus);
                console.log("Error: " + errorThrown);
            }
        });
    }
    function storeLocal(quiz_id) {
        var uid = drupalSettings.user.uid;

        var history = drupalSettings.storage;

        var store = {
            'id':quiz_id,
            'data':{}
        };

        var randomstring = Math.random().toString(36).slice(-8);
        var temp = '';

        if(!getCookie('taketest')){
            temp = setCookie('taketest',randomstring,30);
            if(localStorage.getItem(getCookie('taketest')+quiz_id)){
                localStorage.setItem(getCookie('taketest')+quiz_id, JSON.stringify(store));
            }
        }
        var taketest = getCookie('taketest');

        if(taketest){
            if(!localStorage.getItem(taketest +quiz_id)){
                localStorage.setItem(taketest +quiz_id, JSON.stringify(store));
            }

            if(history){
                for(var i=0;i<history.length;i++){
                    store.data[history[i]['num']] = {'num':history[i]['num'],'ans':history[i]['ans']};
                    localStorage.setItem(taketest+quiz_id, JSON.stringify(store));
                }
            }

            var storage = JSON.parse(localStorage.getItem(taketest +quiz_id));
            if(storage !== null){
                store = storage;
            }
            var uid = taketest + quiz_id;
            var texts = $('input[type="text"]');
            texts.each(function () {
                var num = $(this).attr('data-num');
                if(storage !== null && typeof storage.data[num] !== 'undefined'){
                    $(this).val(storage.data[num].ans);
                    $('#stopwatch').removeClass('paused');
                    $('.qp-item-'+num).removeClass('qp-item-unanswered').addClass('qp-item-answered');

                    $('#txtq'+num).text (storage.data[num].ans);
                }
                $(this).on('change',function () {
                    store.data[num] = {'num':num,'ans':$(this).val()};
                    localStorage.setItem(uid, JSON.stringify(store));
                    if($(this).val()){
                        $('#stopwatch').removeClass('paused');
                        $('.qp-item-'+num).removeClass('qp-item-unanswered').addClass('qp-item-answered');
                    }else {
                        $('.qp-item-'+num).removeClass('qp-item-answered').addClass('qp-item-unanswered');
                    }
                });
            });
            var type_radio = $('.type_radio');
            type_radio.each(function (){
                var num = $(this).attr('data-num');

                if(storage !== null && typeof storage.data[num] !== 'undefined'){
                    $('input[name="q-'+num+'"][value="'+storage.data[num].ans+'"]').attr('checked', 'checked');
                    $(this).val(storage.data[num].ans);
                    $('#stopwatch').removeClass('paused');
                    $('.qp-item-'+num).removeClass('qp-item-unanswered').addClass('qp-item-answered');
                    $('#txtq'+num).text (storage.data[num].ans);
                }
                $('input[name="q-'+num+'"]').on('click change', function(e) {
                    store.data[num] = {'num':num,'ans':$(this).val()};
                    localStorage.setItem(uid, JSON.stringify(store));
                    if($(this).val()){
                        $('#stopwatch').removeClass('paused');
                        $('.qp-item-'+num).removeClass('qp-item-unanswered').addClass('qp-item-answered');
                    }else {
                        $('.qp-item-'+num).removeClass('qp-item-answered').addClass('qp-item-unanswered');
                    }
                });
            });
            var type_drop = $('select[class="iot-question"]');
            type_drop.each(function (){
                var num = $(this).attr('data-num');
                if(storage !== null && typeof storage.data[num] !== 'undefined'){
                    $(this).val(storage.data[num].ans);
                    $('#stopwatch').removeClass('paused');
                    $('.qp-item-'+num).removeClass('qp-item-unanswered').addClass('qp-item-answered');
                    $('#txtq'+num).text(storage.data[num].ans);
                }
                $('#q-'+num).on('change', function(e) {
                    store.data[num] = {'num':num,'ans':$(this).val()};
                    localStorage.setItem(uid, JSON.stringify(store));
                    if($(this).val()){
                        $('#stopwatch').removeClass('paused');
                        $('.qp-item-'+num).removeClass('qp-item-unanswered').addClass('qp-item-answered');
                    }else {
                        $('.qp-item-'+num).removeClass('qp-item-answered').addClass('qp-item-unanswered');
                    }
                });
            });
            var type_checkbox = $('.type_checkbox');
            type_checkbox.each(function (){
                var num = $(this).find('.iot-question').attr('data-num');
                if(storage !== null && typeof storage.data[num] !== 'undefined'){
                    for(var i =0; i<storage.data[num].ans.length; i++){
                        $('input[name="q-'+num+'"][value='+storage.data[num].ans[i]+']').attr('checked', true);
                        $(this).val(storage.data[num].ans);
                        $('#stopwatch').removeClass('paused');
                        $('.qp-item-'+num).removeClass('qp-item-unanswered').addClass('qp-item-answered');
                         $('#txtq'+num).text(storage.data[num].ans.join());
                    }
                }else {
                    store.data[num]  = {'num':num,'ans':[]};
                }
                $('input[name="q-'+num+'"]').on('click change', function(e) {
                    if(storage !== null && typeof storage.data[num] !== 'undefined'){
                        store.data[num] = storage.data[num];
                    }
                    var ans = $('#q-'+num).find('input[name="q-'+num+'"]:checked').map(function(){
                        return this.value; }).get();
                    store.data[num] = {'num':num,'ans':ans};
                    localStorage.setItem(uid, JSON.stringify(store));
                    if(ans){
                        $('#stopwatch').removeClass('paused');
                        $('.qp-item-'+num).removeClass('qp-item-unanswered').addClass('qp-item-answered');
                    }else {
                        $('.qp-item-'+num).removeClass('qp-item-answered').addClass('qp-item-unanswered');
                    }
                      $('#txtq'+num).text(store.data[num].ans.join());
                });
            });
        }

    }
    function initTimer(quiz_id) {
        var uid = drupalSettings.user.uid;
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
        var interval = setInterval(function() {
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
    function setCookie(name,value,days) {
        var expires = "";
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days*24*60*60*1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "")  + expires + "; path=/";
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
    function eraseCookie(name) {
        document.cookie = name+'=; Max-Age=-99999999;';
    }
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

    function update_result_review(){
        var type_blank = $('.type_blank');
        type_blank.each(function (){
            var textInput = $(this).find('input[type="text"]');
            textInput.each(function () {
                var num = $(this).attr('data-num');
                $("#txtq"+num).text($(this).val());
            $(this).on("propertychange change keyup paste input", function(){
                    $("#txtq"+num).text($(this).val());
                });

            });
        });
        var type_drop = $('.drop_down');
        type_drop.each(function (){
            var dropInput = $(this).find('select[class="iot-question"]');
            dropInput.each(function (){
                var num = $(this).attr('data-num');
                $("#txtq"+num).text($(this).val());
                $(this).on("change", function(){
                    $("#txtq"+num).text($(this).val());
                });
            });
        });
        var type_radio = $('.type_radio');
        type_radio.each(function (){
            var num = $(this).attr('data-num');
            var type = $(this).attr('data-q_type');
            if($(this).find('input[name="q-'+num+'"]:checked')){
                var ans = $(this).find('input[name="q-'+num+'"]:checked').val();
                $("#txtq"+num).text(ans);
            }
            $(this).find('input[name="q-'+num+'"]').on('click',function(){
                $("#txtq"+num).text($(this).val());
            });

        });
        var type_checkbox = $('.type_checkbox');
        type_checkbox.each(function (){
            var num = $(this).find('.iot-question').attr('data-num');
            var type = $(this).find('.iot-question').attr('data-q_type');
            if($(this).find('input[name="q-'+num+'"]:checked')){
                var ans = $(this).find('input[name="q-'+num+'"]:checked').val();
                $("#txtq"+num).text(ans);
            }
            $(this).find('input[name="q-'+num+'"]').on('click',function(){
                $("#txtq"+num).text($(this).val());
            });
        });
    }
})(jQuery,Drupal,drupalSettings);;
