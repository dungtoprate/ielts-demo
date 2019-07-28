(function ($, Drupal) {
    Drupal.behaviors.audioIntegrate = {
        attach: function (context, settings) {
            function getQueryStringValue(key) {
                return decodeURIComponent(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
            }

            document.addEventListener('DOMContentLoaded', function () {

                var mediaElements = document.querySelectorAll('audio'), i, total = mediaElements.length;

                for (i = 0; i < total; i++) {
                    new MediaElementPlayer(mediaElements[i], {
                        pluginPath: 'build/',
                        success: function (media) {
                            var renderer = document.getElementById(media.id + '-rendername');

                            media.addEventListener('loadedmetadata', function () {
                                var src = media.originalNode.getAttribute('src').replace('&amp;', '&');
                                if (src !== null && src !== undefined) {
                                    renderer.querySelector('.src').innerHTML = '<a href="' + src + '" target="_blank">' + src + '</a>';
                                    renderer.querySelector('.renderer').innerHTML = media.rendererName;
                                    renderer.querySelector('.error').innerHTML = '';
                                }
                            });

                            media.addEventListener('error', function (e) {
                                renderer.querySelector('.error').innerHTML = '<strong>Error</strong>: ' + e.message;
                            });

                            media.play();
                            media.stop();


                        }
                    });
                }
            });
            $(".player-test .player-loading").show();
            $(document).on('show.bs.modal', '#drupal-modal', function () {
                $(".player-test .player-loading").hide();
            });
            setTimeout(function(){
                $(".player-test .player-loading").html(Drupal.t('Please')+' <a href="javascript:void(0);" onclick="playBtnClick()" class="play-btn">'+Drupal.t('play')+'</a> '+Drupal.t('the audio to start the test'));
            },3000)
        }
    }
})(jQuery, Drupal);

function playBtnClick(){
               $(".mejs__playpause-button button").click();               
           }
 


  ;
