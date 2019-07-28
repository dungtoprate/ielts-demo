(function($) {
    // Remove unread status 
    function removeUnreadStatus (){
        $('.order-item').click(function(event) {
            $(this).removeClass('unread');
        });
    }
    function openNotificationPopup(){
        $('.icon-notification-mb').click(function(event) {           
            $('body').addClass('open-notification');
        });
    }
    //show and hide mobile notification detail
    function showHideNotificationItem(){
        //close header notification popup
        $('#notification-closebt').click(function(event) {
            $('body').removeClass('open-notification');
            $('#notification-tabs').show();
            $('.notifi-popup-mobile .tab-content').find('.tab-pane').removeClass('active in');
        });
         //show notification detail
        $('.notifi-popup-mobile .order-item').click(function(event) {
            $(this).parent().hide();
            $('.notifi-popup-mobile .title').addClass('active');
        });
         //hide notification detail
        $('.notifi-popup-mobile .title').click(function(event) {
            $('#notification-tabs').show();
            $(this).removeClass('active');
            $(this).siblings('.tab-content').find('.tab-pane').removeClass('active in')
        });
    }
    // open mobile messages popup
    function openMobileMessagesPopup(){
        $('.icon-messages-mb').click(function(event) {           
            $('body').addClass('open-messages');
        });
    }
    //show and hide mobile messages detail
    function showHideMessageItem(){
        //close header messages popup
        $('#messages-closebt').click(function(event) {
            $('body').removeClass('open-messages');
            $('#messages-tabs').show();
            $('.messages-popup-mobile .tab-content').find('.tab-pane').removeClass('active in');
        });
         //show messages detail
        $('.messages-popup-mobile .mess-item').click(function(event) {
            $(this).parent().hide();
            $('.messages-popup-mobile .mes-title-top').addClass('active');
        });
        $('.messages-popup-mobile .mes-title-top').click(function(event) {
            $('#messages-tabs').show();
            $(this).removeClass('active');
            $(this).parent().siblings('.tab-content').find('.tab-pane').removeClass('active in')
        });

    }
    // remove placeholder on focus
    function removePlaceholder(){
        $('input,textarea').focus(function(){
           $(this).data('placeholder',$(this).attr('placeholder'))
                  .attr('placeholder','');
        }).blur(function(){
           $(this).attr('placeholder',$(this).data('placeholder'));
        });
    }
    // select language and currency
    function selectCurrencyLanguage() {
        if ($('.language-selectpicker.bootstrap-select').is(':visible')) return;
        $('.language-selectpicker,.currency-selectpicker').selectpicker();
    }
    /* ----------------------------------------------- */
    /* ------------- FrontEnd Functions -------------- */
    /* ----------------------------------------------- */

    /* OnLoad Page */
    $(document).ready(function($) {
        removeUnreadStatus();
        openNotificationPopup();
        showHideNotificationItem();
        showHideMessageItem();
        openMobileMessagesPopup();
        removePlaceholder();
        selectCurrencyLanguage();

    });
})(jQuery);
;
