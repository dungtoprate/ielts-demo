(function ($, Drupal, drupalSettings) {
    Drupal.behaviors.Notify = {
        attach: function (context, settings) {


            var cookj = getCookie('notificationOrder');
            if(cookj ==''){
                $.get("/notify/callback", function (data, status) {
                    if (status == 'success') {
                        var js = JSON.stringify(data);
                        var obj = JSON.parse(js);
                        if (typeof obj.name != 'undefined' && typeof obj.message != 'undefined' && typeof obj.time != 'undefined' ) {

                        $('#notification').html('<div clas="message-notify"><div class="message"><p class="name-notify">' + obj.name + '</p> <p class="content-notify">' + obj.message + '</p> <p class="time-notify">' + obj.time + '</p> </div> <a class="notify-close" href="#">x</a> </div>');
                        var minSeconds = 10;
                        var maxSeconds = 60;
                        var minMilliseconds = minSeconds * 1000;
                        var extraMilliseconds = (maxSeconds - minSeconds) * 1000;
                        setTimeout(function () {
                            console.log(minMilliseconds + Math.random() * (extraMilliseconds));
                            $('#notification').fadeIn("slow");
                            setTimeout(function () {
                                $('#notification').fadeOut('slow');
                            }, 5000);
                            setCookie('notificationOrder', '1', 1);
                        }, minMilliseconds + Math.random() * (extraMilliseconds));
                    }
                }
                });
                //set cookie

            }

            if ($('a.notify-close').length > 0) {
                $('a.notify-close').on('click', function () {
                    $('#notification').fadeOut('slow');
                });
            }


            /**
             * Set a cookie
             * @param {String} cname, cookie name
             * @param {String} cvalue, cookie value
             * @param {Int} exdays, number of days before the cookie expires
             */
            function setCookie(cname, cvalue, exdays) {
                var d = new Date(); //Create an date object
                d.setTime(d.getTime() + (exdays * 1000 * 60 * 60)); //Set the time to exdays from the current date in milliseconds. 1000 milliseonds = 1 second
                var expires = "expires=" + d.toGMTString(); //Compose the expirartion date
                window.document.cookie = cname + "=" + cvalue + "; " + expires;//Set the cookie with value and the expiration date
            }

            /**
             * Get a cookie
             * @param {String} cname, cookie name
             * @return {String} String, cookie value
             */
            function getCookie(cname) {
                var name = cname + "="; //Create the cookie name variable with cookie name concatenate with = sign
                var cArr = window.document.cookie.split(';'); //Create cookie array by split the cookie by ';'

                //Loop through the cookies and return the cooki value if it find the cookie name
                for (var i = 0; i < cArr.length; i++) {
                    var c = cArr[i].trim();
                    //If the name is the cookie string at position 0, we found the cookie and return the cookie value
                    if (c.indexOf(name) == 0)
                        return c.substring(name.length, c.length);
                }

                //If we get to this point, that means the cookie wasn't find in the look, we return an empty string.
                return "";
            }

            /**
             * Delete a cookie
             * @param {String} cname, cookie name
             */
            function deleteCookie(cname) {
                var d = new Date(); //Create an date object
                d.setTime(d.getTime() - (1000 * 60 * 60 * 24)); //Set the time to the past. 1000 milliseonds = 1 second
                var expires = "expires=" + d.toGMTString(); //Compose the expirartion date
                window.document.cookie = cname + "=" + "; " + expires;//Set the cookie with name and the expiration date

            }
            function clearCookieNotify(){
                deleteCookie('notificationOrder');
            }
            
            $(".back-home").on("click", function(e){                                
                var after_register_dest_href = localStorage.getItem("after_register_dest");
                localStorage.removeItem("after_register_dest");
                if(after_register_dest_href) {
                  $(this).attr("href",after_register_dest_href+'?submit=true');    
                }                
              });

        }
    }
})(jQuery, Drupal, drupalSettings);
;
