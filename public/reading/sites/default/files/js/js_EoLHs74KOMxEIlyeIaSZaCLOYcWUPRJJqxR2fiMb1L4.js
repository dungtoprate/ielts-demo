(function ($, Drupal) {
    Drupal.behaviors.readingFront = {
        attach: function (context, settings) {


            $("a.trigger-section-tab").each(function () {
                $(this).click(function (event) {
                    event.preventDefault();
                    //split one
                    var id = $(this).attr('data');
                    //set tab
                    var element_id = $(this).attr('href');
                    $(".tab-section-reading").removeClass('active');
                    $(element_id).addClass('active');

                    //split two
                    $(".tab-section-question-reading").removeClass('active');
                    $("#set-question-" + id).addClass('active');
                    $(".split-item").getNiceScroll().resize();
                });

            });

            $('.reading-footer').on('click', '.qp-item', function (event) {
              event.preventDefault();
              var id = $(this).attr('data-section');
              var qid = $(this).attr('data-q');
              var tagName = $("#"+ qid)[0].tagName;
              if (!$('#set-question-' + id).hasClass('active')) {
                $(".tab-section-reading").removeClass('active');
                $(".tab-section-reading").addClass('hidden');
                $("#set-container-" + id).addClass('active');
                $("#set-container-" + id).removeClass('hidden');

                //split two
                $(".tab-section-question-reading").removeClass('active');
                $(".tab-section-question-reading").addClass('hidden');
                $("#set-question-" + id).addClass('active');
                $("#set-question-" + id).removeClass('hidden');
                $(".split-item").getNiceScroll().resize();

                if (tagName === 'INPUT' || tagName === 'SELECT') {
                  $("#"+ qid).focus();
                }
              }

              //SplitResize();
              //$(".trigger-section-tab-"+id).click();
              var off = $("#"+ qid).offset().top;
              if (tagName === 'DIV') {
                $('#slpit-two').animate({ scrollTop: off - 30}, 100);
              }
              // $('#slpit-two').getNiceScroll().doScrollTop(off + 100, 100);
              // $('#slpit-two').animate({ scrollTop: off - 30}, 100);
              $('#slpit-one').animate({scrollTop: 1}, 'slow');
            })

            $(".testing .qp-item").each(function () {
              $(this).click(function (event) {
                event.preventDefault();
                var id = $(this).attr('data-section');
                var qid = $(this).attr('data-q');
                $(".tab-section-reading").removeClass('active');
                $(".tab-section-reading").addClass('hidden');
                $("#set-container-" + id).addClass('active');
                $("#set-container-" + id).removeClass('hidden');

              //split two
              $(".tab-section-question-reading").removeClass('active');
              $(".tab-section-question-reading").addClass('hidden');
              $("#set-question-" + id).addClass('active');
              $("#set-question-" + id).removeClass('hidden');
              //SplitResize();
              //$(".trigger-section-tab-"+id).click();
              var off = $("#"+ qid).offset().top;
              $('html, body').animate({ scrollTop: off - 100 }, 100);
              $('#slpit-one').animate({scrollTop: 1}, 'slow');
              $(".split-item").getNiceScroll().resize();
            })
          });
            $("a.actions-section").each(function () {
                $(this).click(function (event) {
                    event.preventDefault();
                    var id = $(this).attr('data');
                    $(".tab-section-reading").removeClass('active');
                    $(".tab-section-reading").addClass('hidden');
                    $("#set-container-" + id).addClass('active');
                    $("#set-container-" + id).removeClass('hidden');

                    //split two
                    $(".tab-section-question-reading").removeClass('active');
                    $(".tab-section-question-reading").addClass('hidden');
                    $("#set-question-" + id).addClass('active');
                    $("#set-question-" + id).removeClass('hidden');
                    //SplitResize();
                    //$(".trigger-section-tab-"+id).click();
                    $(".split-item").getNiceScroll().resize();
                    $('#slpit-one').animate({scrollTop: 1}, 'slow');
                    $('#slpit-two').animate({scrollTop: 1}, 'slow');
                })
            });
            $("a.locate-explain").each(function(){
                var _class = $(this).attr('data');
               $(this).click(function(e){
                   e.preventDefault();
                   //$("#slpit-two").animate({ scrollTop:$("."+_class).offset().top -300}, 500);
                   scrollto(_class);
               });
            });

            function scrollto(n) {

                var t = 200, r = $("#slpit-two").offset().top, u = $("." + n).position().top, f = $("#slpit-two").scrollTop(),
                    i = u + f;
                var windowWidth = parseFloat($(window).width());
                if (windowWidth <= 768)
                {
                    t = r;
                }
                i != t ? $("#slpit-two").animate({scrollTop: i - t}, {
                    duration: 200, complete: function () {
                        // showIndicator(n)
                    }
                }) : showIndicator(n)
            }
            function showIndicator(n) {
                // $("#questionIndicator").css({top: $("." + n).offset().top - 50, left: $("." + n).offset().left});
                // $("#questionIndicator").show();
                // $("#questionIndicator").fadeOut(5e3)
            }

            $("a.share-result").each(function(){
               $(this).click(function(e){
                   e.preventDefault();
                  $("input.share-result").select();
                 document.execCommand("Copy");
               }) ;
            });
          $("a.leader-board").each(function(){
            $(this).click(function(e){
              e.preventDefault();
              $("input.leader-board").select();
              document.execCommand("Copy");
            }) ;
          });
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

          $("a.btn-show-note").each(function(){
            $(this).click(function(e){
              e.preventDefault();
              setTimeout(function () {
                $(".split-item").each(function () {
                  $(this).css('height', '90%');
                  $(this).css('height', '100%');
                });
              }, 500)
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




        }
    }
  var markSelection = (function () {
    var markerTextChar = "\ufeff";
    var markerTextCharEntity = "&#xfeff;";

    var markerEl, markerId = "sel_" + new Date().getTime() + "_" + Math.random().toString().substr(2);

    var selectionEl;

    return function () {
      var sel, range;

      if (document.selection && document.selection.createRange) {
        range = document.selection.createRange().duplicate();
        range.collapse(false);

        range.pasteHTML('<span id="' + markerId + '" style="position: relative;">' + markerTextCharEntity + '</span>');
        markerEl = document.getElementById(markerId);
      } else if (window.getSelection) {
        sel = window.getSelection();

        if (sel.getRangeAt) {
          if (sel.rangeCount > 0)
          { range = sel.getRangeAt(0).cloneRange(); }
        } else {
          range.setStart(sel.anchorNode, sel.anchorOffset);
          range.setEnd(sel.focusNode, sel.focusOffset);

          if (range.collapsed !== sel.isCollapsed) {
            range.setStart(sel.focusNode, sel.focusOffset);
            range.setEnd(sel.anchorNode, sel.anchorOffset);
          }
        }

        if (sel.toString() !== "" && sel.toString() !== " ") {


          range.collapse(true);

          markerEl = document.createElement("span");
          markerEl.id = markerId;
          markerEl.appendChild(document.createTextNode(markerTextChar));
          range.insertNode(markerEl);
        }
      }

      if (markerEl) {
        if (sel.toString() !== "") {
          $("#context-menu").show();
        }

        var obj = markerEl;
        var left = 0, top = 0;
        if (typeof viewAnswerMode === 'undefined') {
          left += obj.offsetLeft;
          top += obj.offsetTop;
        } else {
          left += $(obj).offset().left - $('#slpit-one').offset().left;
          top += $(obj).offset().top - $('#slpit-one').offset().top;
        }
        top = top - 41;
        if (typeof extraHeightCom !== 'undefined') {
          top = top + extraHeightCom;
        }
        left = left - 15;
        $("#context-menu").css("top", top).css("left", left);
        if (markerEl.parentNode) {
          markerEl.parentNode.removeChild(markerEl);
        }
      }
    };
  })();
  var lastHighlight;
  $(document).ready(function () {
    $('.split-right')
        .on('mouseup',
            function (e) {
              markSelection();
            });
    $('.cm-item').on('mousedown',
        function (e) {
          var c_class = $(this).attr('data-color');
          if(c_class==='cm-delete'){
            unHighlightText();
          }else{
            highlightText(c_class);
          }
        }
    );
  });

  function getSelectedText() {
    var t = '';
    if (window.getSelection) {
      t = window.getSelection();
    } else if (document.getSelection) {
      t = document.getSelection();
    } else if (document.selection) {
      t = document.selection.createRange().text;
    }
    return t;
  }

  function highlightText(className) {
    var selection = getSelectedText();
    var selection_text = selection.toString();
    if (selection_text !== "") {
      var span = document.createElement('SPAN');
      span.className = className;
      span.textContent = selection_text;
      var range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(span);
      lastHighlight = span;
      $("#context-menu").hide();
      document.getSelection().removeAllRanges();
    }
  }
  function unHighlightText() {
    if (lastHighlight && lastHighlight.tagName === "SPAN" && lastHighlight.className.includes("hl")) {
      $(lastHighlight).contents().unwrap();
      $("#context-menu").hide();
      document.getSelection().removeAllRanges();
    }
  }

})(jQuery, Drupal);
;
