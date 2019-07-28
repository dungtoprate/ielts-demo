(function ($, Drupal, drupalSettings, io, window) {
  "use strict";

  var initialized, notiSocket, debug = false, isLoading = false,
    secret = drupalSettings.privateMessageNodejs.nodejsSecret, mobile_load = false,
    container = $('.table-chat-content .mess-content');

  function iot_msg_noti() {
    // Only initialize once.
    if (!initialized) {
      initialized = true;

      // Update unread msg
      notiSocket = io(drupalSettings.privateMessageNodejs.nodejsUrl + "/pm_inbox");

      notiSocket.on('connect', function () {

        if (drupalSettings.user.uid !== 0) {
          if (debug) {
            window.console.log("Connecting to inbox Node.js server user id ", drupalSettings.user.uid);
          }

          notiSocket.emit('user', drupalSettings.user.uid, secret);
          notiSocket.emit('update pm inbox', drupalSettings.user.uid, secret);
        }
      });

      //new private message
      notiSocket.on('update pm inbox', function () {
        getNewInbox();
      });

      if (debug) {
        // Listen for an emission informing of a notification of an invalid
        // secret.
        notiSocket.on("invalid secret", function (secret) {
          window.console.log("Server rejected secret as invalid: " + secret);
        });
      }
    }
  }

  function getNewInbox() {
    if (!isLoading) {
      isLoading = true;
      // console.log("GEting: ", Drupal.url('account/messages/notification/' + drupalSettings.user.uid))
      $.get(Drupal.url('account/messages/notification/' + drupalSettings.user.uid))
        .done(function (response) {
          isLoading = false;
          // console.log("New msg uid - ", drupalSettings.user.uid, response);
          if (response === false) {
            $('.user-messages-wrap .icon-messages.plus').removeClass('plus');
            $('.user-messages-wrap .unread-messages').empty();
            $('.private-message-notification-wrapper').removeClass('unread-message').children('.private-message-page-link').html(0);
            $('.user-messengers .icon-messages-mb .number').html('');
          } else {
            var unreadCount = 0;
            for (var thread_id in response) {
              unreadCount++;
              if ($('.table-chat-content .mess-content').length && $('.table-chat-content .mess-content').data('threadid') == thread_id) return;
              var msg = response[thread_id];
              var thread_url = Drupal.url('account/messages#thread-' + thread_id);
              if ($('.user-messages-wrap .unread-messages li[data-thread="'+ thread_id +'"]').length) {
                $('.user-messages-wrap .unread-messages li[data-thread="'+ thread_id +'"]').find('.short-message').html(msg.message[0].message);
                $('.user-messages-wrap .unread-messages li[data-thread="'+ thread_id +'"]').find('.date').html(msg.message[0].created.time);
              }
              else {
                $('.user-messages-wrap .unread-messages').append('<li class="clearfix" data-thread="' + thread_id + '">\n' +
                  '                                    <a href="' + thread_url + '">\n' +
                  '                                        <span class="schollmate-avatar">' + msg.member.img + '</span>\n' +
                  '                                        <span class="mess-wrap">\n' +
                  '                                            <span class="partner-name">' + msg.member.name + '</span>\n' +
                  '                                            <span class="short-message">' + msg.message[0].message + '</span>\n' +
                  '                                        </span>\n' +
                  '                                        <span class="date">' + msg.message[0].created.time + '</span>\n' +
                  '                                    </a>\n' +
                  '                                </li>');
              }

              if ($('#messager-nav li[data-thread="'+ thread_id +'"]').length) {
                $('#messager-nav li[data-thread="'+ thread_id +'"]').find('.date').html(msg.message[0].created.time);
                $('#messager-nav li[data-thread="'+ thread_id +'"]').find('.short-message').html(msg.message[0].message);
              } else {
                if ($('#messager-nav > li.empty').length) {
                  $('#messager-nav').empty();
                }
                $('#messager-nav').append('<li data-thread="'+ thread_id +'" data-lastmsg="'+ msg.message[0].id +'" data-members="'+ drupalSettings.user.uid + ',' +msg.member.uid +'">' +
                  '<div data-toggle="tab" data-target="#user-id'+ thread_id +'" class="clearfix">' +
                  '  <div class="schollmate-avatar"><img src="'+ msg.member.src +'" alt="'+ msg.member.name +'"></div>' +
                  '  <div class="mess-wrap">' +
                  '    <a href="javascript:;" class="partner-name">'+ msg.member.name +'</a>' +
                  '    <div class="short-message">'+ msg.message[0].message +'</div>' +
                  '  </div>' +
                  '  <div class="date">'+ msg.message[0].created.time +'</div>' +
                  '</div>' +
                  '</li>');
                if ($('#messager-nav > li').length === 1) {
                  $('#messager-nav').find('li[data-thread="'+ thread_id +'"]').trigger('click');
                }
              }
            }
            if (unreadCount > 100) {
              $('.user-messages-wrap .icon-messages').addClass('plus');
              unreadCount = 10;
            }
            $('.private-message-notification-wrapper').addClass('unread-message').children('.private-message-page-link').html(unreadCount);
            $('.user-messengers .icon-messages-mb .number').html(unreadCount);
          }
        })
    }
  }

  Drupal.behaviors.notifiMsg = function () {
    if ($('#messager-nav li.active').length) {
      var member_ids = $('#messager-nav li.active').data('members');
      if (member_ids !== '') {
        var members = member_ids.split(',');
        for (var i in members) {
          if (members[i] !== drupalSettings.user.uid) {
            notiSocket.emit('update pm inbox', members[i], secret);
          }
        }
      }
    }
  }

  Drupal.behaviors.iot_message_notification = {
    attach: function attach(context) {
      iot_msg_noti();
      Drupal.behaviors.notifiMsg();

      if ($('.user-messengers .icon-messages-mb').length) {
        $('.user-messengers .icon-messages-mb').on('click', function (e) {
          e.preventDefault();
          if (!mobile_load) {
            mobile_load = true;
            Drupal.ajax({url: Drupal.url('account/messages')}).execute();
          }
        });
      }
    }
  }
})(jQuery, Drupal, drupalSettings, io, window);
;
