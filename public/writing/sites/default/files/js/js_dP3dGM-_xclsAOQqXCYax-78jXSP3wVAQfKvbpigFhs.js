(function ($, Drupal, drupalSettings) {
    Drupal.behaviors.iotCommerceModalTopup = {
        attach: function (context, settings) {
            var lang = drupalSettings.language;

          //Disable multiple click submit checkout
          if ($('.form-submit.btn-checkout').length) {
            if ($('#modal-insu-credit').length) {
              $('#modal-insu-credit').on('hidden.bs.modal', function (e) {
                $('.btn-checkout').removeAttr('disabled');
              });
            }

            $('.form-submit.btn-checkout').each(function (index, input) {
                  var form = $(input).closest('form');

                  form.on('submit', function(e) {
                      $(input).attr('disabled', 'disabled');
                  });
              });
          }

            const inputElement = document.getElementById('dollar-value');
            const suffixElement = document.getElementById('dollar-symbol');
            inputElement.addEventListener('input', updateSuffix);
            updateSuffix();
            function updateSuffix() {
                const width = getTextWidth(inputElement.value, 'bold 32px Raleway');
                suffixElement.style.left = -width / 2 + 'px';
            }

            /**
             * Uses canvas.measureText to compute and return the width of the given text of given font in pixels.
             */
            function getTextWidth(text, font) {
                // re-use canvas object for better performance
                var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
                var context = canvas.getContext("2d");
                context.font = font;
                var metrics = context.measureText(text);
                return metrics.width;
            }

            // function add credits
            function addCreditsValue() {
                var timeout;
                var currentCreditValue = parseInt($('#dollar-value').val()) || 0;
                var currentExcValue = parseFloat($('#exc-currency').data('exc'));
                var currentExCurrency = 0;
                calCurrency(currentCreditValue,currentExcValue);
                $('.credit-board .minus-value').on('click',function(event) {
                    if (currentCreditValue <= 10) {
                        currentCreditValue = (currentCreditValue-1 < 1) ? currentCreditValue : currentCreditValue-1;
                    } else {
                        currentCreditValue = (currentCreditValue-10 < 10) ? 10 : currentCreditValue-10;
                    }
                    $('#dollar-value').val(currentCreditValue);
                    calCurrency(currentCreditValue,currentExcValue);
                    $("span.value").text(currentCreditValue);
                    updateSuffix();
                });
                $('.credit-board .minus-value').on('mousedown',function(event) {
                    timeout = setInterval(function(){
                        if (currentCreditValue <= 10) {
                            currentCreditValue = (currentCreditValue-1 < 1) ? currentCreditValue : currentCreditValue-1;
                        } else {
                            currentCreditValue = (currentCreditValue-10 < 10) ? 10 : currentCreditValue-10;
                        }
                        $('#dollar-value').val(currentCreditValue);
                        calCurrency(currentCreditValue,currentExcValue);
                        $("span.value").text(currentCreditValue);
                    }, 150);
                    updateSuffix();
                });
                $('.credit-board .plus-value').on('click',function(event) {
                    if (currentCreditValue <= 10) {
                        currentCreditValue = (currentCreditValue+1 <= 10) ? currentCreditValue+1 : currentCreditValue+10;
                    } else {
                        currentCreditValue = (currentCreditValue+10 > 1000) ? 1000 : currentCreditValue+10;
                    }
                    $('#dollar-value').val(currentCreditValue);
                    calCurrency(currentCreditValue,currentExcValue);
                    $("span.value").text(currentCreditValue);
                    updateSuffix();
                });
                $('.credit-board .plus-value').on('mousedown',function(event) {
                    timeout = setInterval(function(){
                        if (currentCreditValue <= 10) {
                            currentCreditValue = (currentCreditValue+1 <= 10) ? currentCreditValue+1 : currentCreditValue+10;
                        } else {
                            currentCreditValue = (currentCreditValue+10 > 1000) ? 1000 : currentCreditValue+10;
                        }
                        $('#dollar-value').val(currentCreditValue);
                        calCurrency(currentCreditValue,currentExcValue);
                    }, 150);
                    updateSuffix();
                });
                $('.credit-board .plus-value,.credit-board .minus-value').on('mouseup dragend',function(event) {
                    for (var i = 1; i < 9999; i++)
                        window.clearInterval(i);
                    updateSuffix();
                });
                $('#modal-add-credit').click(function(event) {
                    for (var i = 1; i < 9999; i++)
                        window.clearInterval(i);
                });
                $('#dollar-value').on('change focusout', function(event) {
                    currentCreditValue = parseInt($('#dollar-value').val()) || 0;
                    if (currentCreditValue >= 1 && currentCreditValue <=1000)
                    {
                        currentCreditValue = currentCreditValue;
                    }
                    else if (currentCreditValue < 1){
                        currentCreditValue = 1;
                    }
                    else if  (currentCreditValue > 1000) {
                        currentCreditValue = 1000;
                    }
                    else {
                        return;
                    }
                    calCurrency(currentCreditValue, currentExcValue);
                    $("span.value").text(currentCreditValue);
                });
            }

            function setInputFilter(textbox, inputFilter) {
                ["input", "keydown", "keyup", "mousedown", "mouseup", "select", "contextmenu", "drop"].forEach(function (event) {
                    textbox.addEventListener(event, function () {
                        if (inputFilter(this.value)) {
                            this.oldValue = this.value;
                            this.oldSelectionStart = this.selectionStart;
                            this.oldSelectionEnd = this.selectionEnd;
                        } else if (this.hasOwnProperty("oldValue")) {
                            this.value = this.oldValue;
                            this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
                        }
                    });
                });
            }

            function checkCreditNumber() {
                setInputFilter(document.getElementById("dollar-value"), function (value) {
                    return /^\d*$/.test(value);
                });
            }

            function calCurrency(currentCreditValue, currentExcValue) {
                $('#dollar-value').val(currentCreditValue);
                updateSuffix();
                var currentExCurrency = (currentCreditValue * currentExcValue).toFixed(2);
                currentExCurrency = addCommas(currentExCurrency);
                $('#exc-currency').text(currentExCurrency);
            }

            function addCommas(nStr) {
                nStr += '';
                x = nStr.split('.');
                x1 = x[0];
                x2 = x.length > 1 ? '.' + x[1] : '';
                var rgx = /(\d+)(\d{3})/;
                while (rgx.test(x1)) {
                    x1 = x1.replace(rgx, '$1' + ',' + '$2');
                }
                return x1 + x2;
            }

            // show modal
            $("a.top-up").click(function () {
                $('#modal-add-credit').modal('show');
                $('#modal-add-credit').find('input[name="amount"]').val("100").trigger('change');
                return false;
            });
            var topup;
            $("#topup_credit a.btn-checkout").click(function (e) {
                $(this).attr('disbaled',true);
                e.preventDefault();
                var isWorking = true;
                clearTimeout(topup);
                topup = setTimeout(function () {
                    var amount = $("#dollar-value").val();
                    if (isWorking) {
                        $.ajax({
                            url: "/iot/checkout/draft/order/?amount=" + amount, success: function (result) {
                                if (result != 'notok') {
                                    clearTimeout(topup);
                                    x = 0;
                                    var pre = '';
                                    if(lang != 'en'){
                                        pre = lang + "/";
                                    }
                                    var redirect_url = "/"+pre+"iot/checkout/credits/" + result + "?msg=done";
                                    window.location.href = redirect_url;
                                    var isWorking = false;
                                }
                            }
                        });

                    }
                }, 100);

                return false;

            });

            function findGetParameter(parameterName) {
                var result = null,
                    tmp = [];
                location.search
                    .substr(1)
                    .split("&")
                    .forEach(function (item) {
                        tmp = item.split("=");
                        if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
                    });
                return result;
            }

            /**
             * START - ONLOAD - JS
             */
            /* ----------------------------------------------- */
            /* ------------- FrontEnd Functions -------------- */
            /* ----------------------------------------------- */
            /* OnLoad Page */
            addCreditsValue();
            checkCreditNumber();

        }
    }
})(jQuery, Drupal, drupalSettings);

;
