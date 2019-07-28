(function ($, Drupal) {
  Drupal.behaviors.AccountAction = {
    attach: function (context, settings) {

      /**Preload**/
      //login accountl
      $("form#user-login").submit(function () {
        var tz = jstz.determine();
        var email = $("#user-login input.email").val();
        var pass = $("#user-login input.password").val();
        var isModalLogin = $("div#drupal-modal").length;
        if (isModalLogin > 0) {
          var email = $("div#drupal-modal #user-login input.email").val();
          var pass = $("div#drupal-modal #user-login input.password").val();
        }
        var qid = $("input.get-qid").val();
        if (typeof qid != 'undefined') {
          var time = $('#stopwatch').text();
          localStorage.setItem('time_' + qid, JSON.stringify(time));
        }

        if (email == '') {
          $("#user-login .error-message.email").text(Drupal.t('Username or Email is required.'));
          return false;
        } else {
          $("#user-login .error-message.email").text('');
        }
        if (pass == '') {
          $("#user-login .error-message.password").text(Drupal.t('Password is required.'));
          return false;
        } else {
          $("#user-login .error-message.password").text('');
        }
        var des = $(".destination").val();
        var submit = $(".submit-test").val();
        if (des == '') {
          des = '/account/profile'
        }
        if (submit != '') {
          des = des + '?submit=true'
        }
        $.post('/account/login/callback', { account_email: email, account_password: pass, tz: tz.name() })
          .done(function (data) {
            if (typeof data === 'string') data = JSON.parse(data);
            if (data.status == 1) {
              setTimeout(function () {
                window.location.href = des;
              }, 200);
            } else {
              if (data.message) {
                $(".login-box .error-message.main").html(data.message);
              } else {
                $(".login-box .error-message.main").html(Drupal.t('Your username or password is incorrect. <a href="/user/password"><b>Forgot your password?</b></a>'));
              }
            }
          });
        return false;
      });
      $("form#user-login-form").submit(function () {
        var tz = jstz.determine();

        var email = $("#user-login-form input.email").val();
        var pass = $("#user-login-form input.password").val();
        if (email == '') {
          $("#user-login-form .error-message.email").text(Drupal.t('Username or Email is required.'));
          return false;
        } else {
          $("#user-login-form .error-message.email").text('');
        }
        if (pass == '') {
          $("#user-login-form .error-message.password").text(Drupal.t('Password is required.'));
          return false;
        } else {
          $("#user-login-form .error-message.password").text('');
        }
        var des = $(".destination").val();
        var submit = $(".submit-test").val();
        if (des == '') {
          des = '/account/profile'
        }
        if (submit != '') {
          des = des + '?submit=true'
        }
        $.post('/account/login/callback', { account_email: email, account_password: pass, tz: tz.name() })
          .done(function (data) {
            if (typeof data === 'string') data = JSON.parse(data);
            if (data.status == 1) {
              setTimeout(function () {
                window.location.href = des;
              }, 200);
            } else {
              if (data.message) {
                $(".login-box .error-message.main").html(data.message);
              } else {
                $(".login-box .error-message.main").html(Drupal.t('Your username or password is incorrect. <a href="/user/password"><b>Forgot your password?</b></a>'));
              }
            }
          });
        return false;
      });

      //register user account
      $("form#user-register").submit(function () {
        var tz = jstz.determine();
        // var username = $("form#user-register input.username").val();
        var email = $("form#user-register input.email").val();
        var pass = $("form#user-register input.password").val();
        var confirm_pass = $("form#user-register input.confirm_password").val();
        /*if (username == '') {
            $("form#user-register .error-message.username").text(Drupal.t('Username is required.'));
            return false;
        } else {
            $("form#user-register .error-message.username").text('');
        }*/
        if (email == '') {
          $("form#user-register .error-message.email").text(Drupal.t('Email is required.'));
          return false;
        } else {
          $("form#user-register .error-message.email").text('');
        }
        if (!validateEmail(email)) {
          $("form#user-register .error-message.email").text(Drupal.t('Email is invalid.'));
          return false;
        } else {
          $("form#user-register .error-message.email").text('');
        }
        if (pass == '') {
          $("form#user-register .error-message.password").text(Drupal.t('Password is required.'));
          return false;
        } else {
          $("form#user-register .error-message.password").text('');
        }
        if (confirm_pass == '') {
          $("form#user-register .error-message.confirm_password").text(Drupal.t('Confirm Password is required.'));
          return false;
        } else {
          $("form#user-register .error-message.confirm_password").text('');
        }
        if (pass != confirm_pass) {
          $("form#user-register .error-message.password").text(Drupal.t('Password is not match.'));
          return false;
        } else {
          $("form#user-register .error-message.password").text('');
        }
        var des = $("form#user-register .destination").val();
        $.post('/account/register/callback', {
          // account_username: username,
          account_email: email,
          account_password: pass,
          tz: tz.name()
        })

          .done(function (data) {

            if (data == 1) {
              setTimeout(function () {
                window.location.href = des + '?build_profile=true';
              }, 500);
            } else {
              $("form#user-register").closest('.account').find(".error-message.main").html(data);
            }
          });
        return false;
      });
      $("#user-register-form").submit(function () {
        var tz = jstz.determine();
        // var username = $("#user-register input.username").val();
        var email = $("#user-register input.email").val();
        var pass = $("#user-register input.password").val();
        var confirm_pass = $("#user-register input.confirm_password").val();
        /*if (username == '') {
            $("#user-register .error-message.username").text(Drupal.t('Username is required.'));
            return false;
        } else {
            $("#user-register .error-message.username").text('');
        }*/
        if (email == '') {
          $("#user-register .error-message.email").text(Drupal.t('Email is required.'));
          return false;
        } else {
          $("#user-register .error-message.email").text('');
        }
        if (!validateEmail(email)) {
          $("#user-register .error-message.email").text(Drupal.t('Email is invalid.'));
          return false;
        } else {
          $("#user-register .error-message.email").text('');
        }
        if (pass == '') {
          $("#user-register .error-message.password").text(Drupal.t('Password is required.'));
          return false;
        } else {
          $("#user-register .error-message.password").text('');
        }
        if (confirm_pass == '') {
          $("#user-register .error-message.confirm_password").text(Drupal.t('Confirm Password is required.'));
          return false;
        } else {
          $("#user-register .error-message.confirm_password").text('');
        }
        if (pass != confirm_pass) {
          $("#user-register .error-message.password").text(Drupal.t('Password is not match.'));
          return false;
        } else {
          $("#user-register .error-message.password").text('');
        }
        var des = $(".destination").val();
        $.post('/account/register/callback', {
          // account_username: username,
          account_email: email,
          account_password: pass,
          tz: tz.name()
        })
          .done(function (data) {

            if (data == 1) {
              setTimeout(function () {
                window.location.href = des + '?build_profile=true';
              }, 500);
            } else {
              $("#user-register-form .error-message.main").html(data);
            }
          });
        return false;
      });

      ///build profile


      $(".bp-control .cancel").each(function () {
        var id = $(this).attr('href');
        $(this).click(function (event) {
          $(".build-profile").addClass('hidden');
          $(id).removeClass('hidden');
          event.preventDefault();
        });
      });

      $('.str-item').click(function () {
        $(this).parent().find('.str-item').removeClass("active");
        $(this).addClass("active");
      });

      // $('.starbox-item a').hover(function () {
      //   $(this).addClass('hover');
      //   $(this).prevAll().addClass("hover");
      //   $(this).prevAll().removeClass("hover-fa-star-o");
      //   $(this).nextAll().removeClass("hover");
      //   $(this).nextAll().addClass("hover-fa-star-o");
      // });
      $('.starbox-item a').each(function () {
        $(this).hover(function () {
          $(this).addClass('hover');
          $(this).removeClass("hover-fa-star-o");
          $(this).prevAll().addClass("hover");
          $(this).prevAll().removeClass("hover-fa-star-o");
          $(this).nextAll().removeClass("hover");
          $(this).nextAll().addClass("hover-fa-star-o");
        })

      });

      $('.starbox-item').mouseleave(function () {
        $(this).find(".hover").removeClass("hover");
        $(this).find(".hover-fa-star-o").removeClass("hover-fa-star-o");
      });

      $('.starbox-item a').click(function () {
        $(this).addClass('click');
        var star = $(this).attr('data-rate');
        $(this).parent().find('.star-data').val(star);
        $(this).prevAll().addClass("click");
        $(this).removeClass("hover-fa-star-o");
        $(this).prevAll().removeClass("hover-fa-star-o");
        $(this).nextAll().removeClass("click");
        $(this).nextAll().removeClass("hover");
        $(this).nextAll().addClass("hover-fa-star-o");
      });


      $('a.click-profile-build').on('click', function (e) {
        $(this).colorbox({ overlayClose: false, width: "700px", height: "auto" });
      });

      /* if (findGetParameter('build_profile') || settings.build_profile) {
        setTimeout(function () {
          $('a.click-profile-build').click();
          $('a.click-profile-build').remove();
        }, 2000);
      } */
      
      if ($("#modal-error").length > 0) {

        setTimeout(function () {
          $.colorbox({ overlayClose: false, inline: true, width: 570, height: 300, href: "#modal-error" });
        }, 2000);
      }
      $(".update-profile-analytics").on('click', function (e) {
        e.preventDefault();
        $.colorbox.close();
        setTimeout(function () {
          $('a.click-profile-build').click();
          $('a.click-profile-build').remove();
          $("#modal-error").remove();
        }, 1000);
      });




      function validateEmail(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email.toLowerCase());
      }

      function findGetParameter(parameterName) {
        var result = null,
          tmp = [];
        location.search
          .substr(1)
          .split("&")
          .forEach(function (item) {
            tmp = item.split("=");
            if (tmp[0] === parameterName)
              result = decodeURIComponent(tmp[1]);
          });
        return result;
      }

      //validate step 2
      var step2 = 0;
      // $(".step2-action").addClass('hidden');
      $(".step2-choose").each(function () {
        if ($(this).hasClass('active')) {
          if ($(".target_score").val() != '' && $(this).attr('data') == 'I have an IELTS score') {
            //    $(".step2-action").removeClass('hidden');
            step2 = 1;
          } else if ($(".target_score2").val() != '' && $(this).attr('data') == "I don't have an IELTS score") {
            //  $(".step2-action").removeClass('hidden');
            step2 = 1;
          } else {
            // $(".step2-action").addClass('hidden');
            step2 = 0;
          }
        }
      });
      $(".step2-choose").each(function () {
        $(this).click(function () {
          $('#colorbox').addClass('step2');
          if ($(this).hasClass('active')) {
            if ($(".target_score").val() != '' && $(this).attr('data') == 'I have an IELTS score') {
              //  $(".step2-action").removeClass('hidden');
              step2 = 1;
            } else if ($(".target_score2").val() != '' && $(this).attr('data') == "I don't have an IELTS score") {
              // $(".step2-action").removeClass('hidden');
              step2 = 1;
            } else {
              // $(".step2-action").addClass('hidden');
              step2 = 0;
            }
          }
        });

      });
      $(".target_score").change(function () {
        if ($(this).val() != '') {
          //  $(".step2-action").removeClass('hidden');
          step2 = 1;
        } else {
          //  $(".step2-action").addClass('hidden');
          step2 = 0;
        }
      });
      $(".target_score2").change(function () {
        if ($(this).val() != '') {
          // $(".step2-action").removeClass('hidden');
          step2 = 1;
        } else {
          // $(".step2-action").addClass('hidden');
          step2 = 0;
        }
      });

      //$("#submit-proced").addClass('hidden');
      var status = 0;
      var rate = 0;
      $(".practicing .str-item").each(function () {
        if ($(this).hasClass('active')) {
          status = 1;
        }
        $(this).click(function () {
          if ($(this).hasClass('active')) {
            status = 1;
          }
          if (status == 1 && rate == 1) {
            //   $("#submit-proced").removeClass('hidden');
          }
        });
      });
      $(".star-data").each(function () {
        if ($(this).val() != '') {
          rate = 1;
        }
      });
      $(".starbox-item a").each(function () {
        $(this).click(function () {
          rate = 1;
          if (rate == 1 && status == 1) {
            //  $("#submit-proced").removeClass('hidden');
          }
        });
      });
      if (status == 1 && rate == 1) {
        // $("#submit-proced").removeClass('hidden');
      }

      $(".bp-control .next").each(function () {
        var id = $(this).attr('href');
        $(this).click(function (event) {
          if (id == '#step3') {
            if (step2 == 1) {
              $(".build-profile").addClass('hidden');
              $(id).removeClass('hidden');
              $(".error-message2").text('');
            } else {
              $(".error-message2").text(Drupal.t('Please choose an option to continue.'));
              return false;
            }
          } else {
            $(".build-profile").addClass('hidden');
            $(id).removeClass('hidden');
            $(".error-message2").text('');

          }

          event.preventDefault();
        });
      });
      //save profil

      $("a#submit-proced").click(function (e) {
        if (status == 0 || rate == 0) {
          $(".error-message3").text(Drupal.t('Please choose an option to continue.'));
          return false;
        }
        $(".error-message2").text('');

        e.preventDefault();
        var field_ima = '';
        $(".pb-choose span").each(function () {
          if ($(this).hasClass('active')) {
            field_ima = $(this).attr('data');
          }
        });
        var field_ielts = '';
        $(".step2-choose").each(function () {
          if ($(this).hasClass('active')) {
            field_ielts = $(this).attr('data');
          }
        });
        var field_previous_score = $(".previous_score").val();
        if (field_ielts == 'I have an IELTS score') {
          var field_target_score = $(".target_score").val();
        } else {
          var field_target_score = $(".target_score2").val();
        }
        var field_practicing = '';
        $(".st3-radio .str-item").each(function () {
          if ($(this).hasClass('active')) {
            field_practicing = $(this).attr('data');
          }
        });
        var field_destination = [];
        $(".st3-item .starbox-item").each(function () {
          var rate = $(this).find('.star-data').val();
          if (rate) {
            var key = $(this).find('.star-data').attr('data-key');
            field_destination.push({ 'rate': rate, 'key': key });
          }
        });
        var des = $("input.destination").val();
        var field_date = $('.step2-content .datetimepicker').val();
        $.post('/account/profile/callback', {
          field_ima: field_ima,
          field_ielts: field_ielts,
          field_previous_score: field_previous_score,
          field_date: field_date,
          field_target_score: field_target_score,
          field_practicing: field_practicing,
          field_destination: field_destination
        })

          .done(function (data) {

            if (data == 1) {
              setTimeout(function () {
                window.location.href = des;
              }, 500);
            } else {
              $(".error-message.main").html(data);
            }
          });
        return false;

      });

      //login verify
      /*$(".login-right a").each(function () {
          $(this).click(function () {
              var submit = $(this).attr('href');
              var at = submit.split('destination=');
              if (!at[1]) {
                  at = submit.split('des=');
              }
              var des = at[1];
              $.post('/account/login/verify', {
                  des: des
              });
              //return false;
          });
      });*/

      /* $("div.login-right > a").on('click', function (e) {
        e.preventDefault();
        var tz = jstz.determine();
        var st = $(this).data('social_type');



        $('#tz').val(tz.name());
        $('#st').val(st);
        $("form[id^='social-login-form']").submit();
      }); */





      //Start dropzoneJS related changes.
      $('button#choose-btn').on('click', function (e) {
        $(this).colorbox({ width: "700px", height: "auto", inline: true, href: "#upload-modal" });
      });
      $('a#close-colobox').on('click', function (e) {
        $.colorbox.close();
      });
      if ($("#myAwesomeDropzone").length > 0) {
        // "myAwesomeDropzone" is the camelized version of the HTML element's ID
        Dropzone.options.myAwesomeDropzone = {
          acceptedFiles: ".png,.jpg,.gif,.bmp,.jpeg",
          dictDefaultMessage: "Drag file here or click to choose file",
          maxFiles: 1,
          init: function () {
            this.on('addedfile', function (file) {
              if (this.files.length > 1) {
                this.removeFile(this.files[0]);
              }
            });
          }


        };
      }
      //End dropzone related changes.
      if ($('input[name="current_pass"]').length && $('input[name="password"]').length && $('input[name="confirm_pass"]').length) {
        $('input[name="current_pass"],input[name="password"],input[name="confirm_pass"]').on('blur', function (e) {
          var curr_pass = $('input[name="current_pass"]').val();
          var pass = $('input[name="password"]').val();
          var conf_pass = $('input[name="confirm_pass"]').val();
          //call ajax to verify password.
          if (curr_pass != '') {
            $.post('/account/verify/password', {
              current_pass: curr_pass,
              password: pass,
              confirm_pass: conf_pass,
            })

              .done(function (data) {

                if (data == 0) {
                  $('#msg_err').text("Current password does not match.");
                  $('#msg_err').removeClass("profile_no_err");
                  $('#msg_err').addClass("profile_err");
                }
                else if (data == 1) {
                  $('#msg_err').text("Current password match.");
                  $('#msg_err').removeClass("profile_err");
                  $('#msg_err').addClass("profile_no_err");
                }
                else if (data == 2) {
                  $('#msg_err_pass').text("New password match with confirm password.");
                  $('#msg_err_pass').removeClass("profile_err");
                  $('#msg_err_pass').addClass("profile_no_err");
                }
                else if (data == 3) {
                  $('#msg_err_pass').text("New password does not match with confirm password.");
                  $('#msg_err_pass').removeClass("profile_no_err");
                  $('#msg_err_pass').addClass("profile_err");
                }

              });
            return false;
          }
        });
      }

      $(".page-node-type-quiz .link-popup-register").on("click", function (e) {
        var dt = $(".page-node-type-quiz").find(".upload-after-reg").attr("data-target");
        if (typeof dt != 'undefined') {
          $(".destination").val("/");
        }
      });
      $(".page-node-type-quiz .link-popup-login").on("click", function (e) {
        var dt = $(".page-node-type-quiz").find(".upload-after-reg").attr("data-target");
        if (typeof dt != 'undefined') {
          $(".destination").val($("input[name=destination]").val());
        }
      });
      $('.delete-testresult').click(function (event) {
          $('#modal-delete-test-pop .con-delete-test').attr("href",$(this).attr("alt"));
      });
      $(".page-node-type-quiz .link-popup-register").on("click", function(e){
        var dt = $(".page-node-type-quiz" ).find( ".upload-after-reg" ).attr("data-target");
        if(typeof dt != 'undefined'){
            $(".destination").val("/");
        }
      });
      $(".page-node-type-quiz .link-popup-login").on("click", function(e){
        var dt = $(".page-node-type-quiz" ).find( ".upload-after-reg" ).attr("data-target");
        if(typeof dt != 'undefined'){
            $(".destination").val($("input[name=destination]").val());
        }
      });
    }
  }
})(jQuery, Drupal);
;
