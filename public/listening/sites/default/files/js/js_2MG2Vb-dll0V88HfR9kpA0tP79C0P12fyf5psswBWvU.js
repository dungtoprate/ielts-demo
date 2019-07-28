(function ($, Drupal) {
    Drupal.behaviors.iot_quizDragDrop = {
        attach: function (context, settings) {
            function selectAnswer() {
                $('.select-table').on('click', 'td', function () {
                    $(this).addClass('active').siblings().removeClass('active');
                });
            }            
                $(init);
                function init() {
                    // Create the pile of shuffled answers

                    $(".hid-option").each(function (index) {

                        var option_str = $(this).val();
                        var answerWords = option_str.split("@@");
                        var answerGap = option_str.split("@@");
                        var custom_id = $(this).attr('rel');
                        answerWords.sort(function () {
                            return Math.random() - .5
                        });

                        for (var i = 0; i < answerWords.length; i++) {
                            $('<div>' + answerWords[i] + '</div>').data({'number': answerWords[i], 'curParent': '', 'prevParent': '', 'onBar': true}).attr('id', 'card' + answerWords[i]).appendTo('#tag-choice-' + custom_id).draggable({
                                containment: '#content',
                                stack: '#tag-choice-' + custom_id + ' div',
                                cursor: 'move',
                                drag: function (event, ui) {
                                    if ($(this).attr("rel") != undefined) {
                                        var rel1 = $(this).attr("rel");
                                        $("a.qp-item-" + rel1).removeClass('qp-item-answered');
                                        $("a.qp-item-" + rel1).addClass('qp-item-unanswered');
                                        $("#txtq" + rel1).text('');
                                    }
                                    $(this).removeClass('inside');
                                },
                                revert: function (event, ui) {
                                    $(this).data("uiDraggable").originalPosition = {
                                        top: 0,
                                        left: 0
                                    };
                                    var className = $(this).data('parentOld')
                                    if (!event) {
                                        $(this).css({
                                            position: 'relative',
                                            top: '0',
                                            left: '0'
                                        });
                                        $(this).data('onBar', true)
                                        $(this).removeClass(className + ' inside');
                                        $('#' + className).removeClass('answered');
                                    }
                                    else {
                                        $(this).data('onBar', false)
                                    }
                                    return !event;
                                }
                            });
                        }
                        var tagMinHeight = $('#tag-choice-' + custom_id).outerHeight(true);
                        $('#tag-choice-' + custom_id).css('min-height', tagMinHeight);
                        // Create the word slots                        
                        for (var i = 1; i <= answerGap.length; i++) {
                            $('<div class="answer-gap" rel="' + $('#answerSlots' + custom_id + '-' + i).attr('rel') + '"></div>').data({'number': answerGap[i - 1]}).appendTo('#answerSlots' + custom_id + '-' + i).droppable({
                                accept: '#tag-choice-' + custom_id + ' div',
                                hoverClass: 'hovered',
                                drop: handleAnswerDrop,
                                over: function (event, ui) {
                                },
                                out: function (event, ui) {
                                },
                                activate: function (event, ui) {
                                    $(this).parent().removeClass('demo');
                                }
                            });
                        }
                    });
                }

                function handleAnswerDrop(event, ui) {
                    var rel = $(this).attr('rel');
                    $("a.qp-item-" + rel).removeClass('qp-item-unanswered');
                    $("a.qp-item-" + rel).addClass('qp-item-answered');
                    $("#txtq" + rel).text('yes');
                    // check if this parent has element
                    $(this).parent().addClass('answered')
                    var userAnswer = $(this).data('number');
                    var systemAnswer = ui.draggable.data('number');
                    $("#txtq" + rel).text(systemAnswer);
                    if (userAnswer == systemAnswer) {
//                console.log('correct answer');
                        $(this).parent().data('answer', true);
                    }
                    else {
//                console.log('wrong answer');
                        $(this).parent().data('answer', false);
                    }
                    //drag and drop process
                    var currentParentId = $(this).parent().attr('id');
                    var dataParentOld = ui.draggable.data('parentOld') ? ui.draggable.data('parentOld') : currentParentId;
                    ui.draggable.data('parentOld', currentParentId)
                    if (ui.draggable.data('onBar')) {
                        $('.' + currentParentId).css({
                            top: '0',
                            left: '0'
                        });
                        $('.' + currentParentId).css('position', 'relative');
                        $('.' + currentParentId).data('onBar', true).removeClass(currentParentId + ' inside');
                        ui.draggable.attr("rel", rel);
                        ui.draggable.attr("rel1", systemAnswer);
                        var pos = ui.draggable.position();
                        console.log(pos.top);
                        console.log(pos.left);
                        ui.draggable.removeClass(dataParentOld).addClass(currentParentId + ' inside');
                        ui.draggable.css('position', 'absolute');
//                        ui.draggable.position({of: $(this), my: 'center center', at: 'center center'});                        
                        $(ui.draggable).css({ "left": pos.left, "top": pos.top });

                    }
                    else {
                        if ($('.' + currentParentId).length != 0) {
                            ui.draggable.position({of: $(this), my: 'center center', at: 'center center'});
                            $('.' + currentParentId).position({of: $('#' + dataParentOld), my: 'center center', at: 'center center'});
                            $('#' + dataParentOld).addClass('answered');
                            $('.' + currentParentId).data('parentOld', dataParentOld)
                            $('.' + currentParentId).removeClass(currentParentId).addClass(dataParentOld + ' inside');
                            $('.' + currentParentId).attr("rel", rel);
                            $('.' + currentParentId).attr("rel1", systemAnswer);
                            ui.draggable.removeClass(dataParentOld).addClass(currentParentId + ' inside');
                            ui.draggable.attr("rel", rel);
                            ui.draggable.attr("rel1", systemAnswer);
                        }
                        else {
                            $('#' + dataParentOld).removeClass('answered');
                            ui.draggable.removeClass(dataParentOld).addClass(currentParentId + ' inside')
                            ui.draggable.position({of: $(this), my: 'center center', at: 'center center'});
                        }
                    }
                }
                selectAnswer();          
        }
    }
})(jQuery, Drupal);
;
