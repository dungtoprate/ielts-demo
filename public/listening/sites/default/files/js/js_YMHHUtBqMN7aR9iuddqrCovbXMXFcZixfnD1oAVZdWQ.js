(function ($, Drupal) {
  Drupal.behaviors.ContactForm = {
    attach: function (context, settings) {

      $("form#contact-form").submit(function () {
        var contactForm = $(this);
        if (contactForm.find('button[type="submit"]').attr('disabled')) return false;
        var email = contactForm.find("input.contact-email").val();
        var name = contactForm.find("input.contact-name").val();
        var title = contactForm.find("input.contact-title").val();
        var message = contactForm.find(".contact-message").val();
        
        var youare = contactForm.find(".contact-youare").val();
        var about = contactForm.find(".contact-about").val();
        var tellusmore = contactForm.find(".tell-us-more").val();
        
        if (email == '') {
          contactForm.find(".error-message.contact-email").text('Email is required.');
          return false;
        } else {
          contactForm.find(".error-message.contact-email").text('');
        }
        if (!validateEmail(email)) {
          contactForm.find(".error-message.contact-email").text('Email is invalid.');
          return false;
        } else {
          contactForm.find(".error-message.contact-email").text('');
        }
        if (name == '') {
          contactForm.find(".error-message.contact-name").text('Name is required.');
          return false;
        } else {
          contactForm.find(".error-message.contact-name").text('');
        }
        if (title == '') {
          contactForm.find(".error-message.contact-title").text('Title is required.');
          return false;
        } else {
          contactForm.find(".error-message.contact-title").text('');
        }
        if (message == '') {
          contactForm.find(".error-message.contact-message").text('Message is required.');
          return false;
        } else {
          contactForm.find(".error-message.contact-message").text('');
        }
        var des = contactForm.find(".destination").val();
        if (des == '') {
          des = '/account/profile'
        }
        contactForm.find("button").attr('disabled','disabled');
        contactForm.find(".preload").show();
        $.post('/contact/form', {name: name, email: email, title:title, message:message, youare:youare, about: about, tellusmore: tellusmore})
            .done(function (data) {
              if (data == 'ok') {
                contactForm.find(".preload").hide();
                contactForm.find("select.contact-youare").val('');
                contactForm.find("select.contact-about").val('');
                contactForm.find("input.tell-us-more").val('');
                
                contactForm.find("input.contact-email").val('');
                contactForm.find("input.contact-name").val('');
                contactForm.find("input.contact-title").val('');
                contactForm.find(".contact-message").val('');
                $('#modal-contact').modal('show');
                contactForm.find("button").attr('disabled',false);
              } else {
                $(".preload").hide();
                $(".error-message.main").html(data);
                contactForm.find("button").attr('disabled',false);
              }
            });
        return false;
      });


        $("form#contact-form-page").submit(function () {
            var contactForm = $(this);
            if (contactForm.find('button[type="submit"]').attr('disabled')) return false;
            var email = contactForm.find("input.contact-email").val();
            var name = contactForm.find("input.contact-name").val();
            var title = contactForm.find("input.contact-title").val();
            var message = contactForm.find(".contact-message").val();
            
            var youare = contactForm.find(".contact-youare").val();
            var about = contactForm.find(".contact-about").val();
            var tellusmore = contactForm.find(".tell-us-more").val();
        
            if (email == '') {
                contactForm.find(".error-message.contact-email").text('Email is required.');
                return false;
            } else {
                contactForm.find(".error-message.contact-email").text('');
            }
            if (!validateEmail(email)) {
                contactForm.find(".error-message.contact-email").text('Email is invalid.');
                return false;
            } else {
                contactForm.find(".error-message.contact-email").text('');
            }
            if (name == '') {
                contactForm.find(".error-message.contact-name").text('Name is required.');
                return false;
            } else {
                contactForm.find(".error-message.contact-name").text('');
            }
            if (title == '') {
                contactForm.find(".error-message.contact-title").text('Title is required.');
                return false;
            } else {
                contactForm.find(".error-message.contact-title").text('');
            }
            if (message == '') {
                contactForm.find(".error-message.contact-message").text('Message is required.');
                return false;
            } else {
                contactForm.find(".error-message.contact-message").text('');
            }
            var des = $(".destination").val();
            if (des == '') {
                des = '/account/profile'
            }
            contactForm.find("button").attr('disabled','disabled');
            contactForm.find(".preload").show();
            $.post('/contact/form', {name: name, email: email, title:title, message:message , youare:youare, about: about, tellusmore: tellusmore})

                .done(function (data) {
                    if (data == 'ok') {
                        contactForm.find(".preload").hide();
                        contactForm.closest('.modal-dialog').find(".modal-header .close").click();
                        
                        contactForm.find("select.contact-youare").val('');
                        contactForm.find("select.contact-about").val('');
                        contactForm.find("input.tell-us-more").val('');
                        
                        contactForm.find("input.contact-email").val('');
                        contactForm.find("input.contact-name").val('');
                        contactForm.find("input.contact-title").val('');
                        contactForm.find(".contact-message").val('');
                        $('#modal-contact').modal('show');
                        contactForm.find("button").attr('disabled',false);

                    } else {
                        $(".preload").hide();
                        $(".error-message.main").html(data);
                        contactForm.find("button").attr('disabled',false);

                    }
                });
            return false;
        });

      function validateEmail(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email.toLowerCase());
      }

jQuery(function($) {
    var main_records = {
        'Student': ['Custom lesson package', 'Report mistake/bug', 'Payment problem', 'Suggestion', 'Other'],
        'IELTS Teacher/Examiner': ['Looking for freelance work', 'Provide Content', 'Other'],
        'IELTS/Teaching Centre':['None'],
        'Potential Partner': ['None'],
        'Others': ['Others'],
    }
    
    var $about_to = $('#about');
    $('#youare').change(function () {
        var youare = $(this).val(), lcns = main_records[youare] || [];
        
        var html = $.map(lcns, function(lcn){
            return '<option value="' + lcn + '">' + lcn + '</option>'
        }).join('');
        $about_to.html(html)
    });
});
if($("select[name='field_qtype_front']") !== 'undefined'){
            if($("select[name='field_qtype_front']").val() == '7') {
                var par= $(".paragraphs-dropbutton-wrapper button");
                par.each(function (){
                    if($(this).val() == 'Add Checkbox Options') {
                                $(this).hide();
                            }
                });
            }

            $("select[name='field_qtype_front'],select[name='field_qtype_front']").on('change', function(e){
                if($("select[name='field_qtype_front']").val() == '7') {
                    var par= $(".paragraphs-dropbutton-wrapper button");
                    par.each(function (){
                        if($(this).val() == 'Add Checkbox Options') {
                                    $(this).hide();
                                }
                    });
                }
            });
        }

    }
  }
})(jQuery, Drupal);
;
