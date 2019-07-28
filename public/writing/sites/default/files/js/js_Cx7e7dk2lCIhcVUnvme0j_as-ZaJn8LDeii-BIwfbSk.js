//Dropzone.autoDiscover = false;
(function ($, Drupal, drupalSettings) {
    Drupal.behaviors.iotWotBehavior = {
        attach: function (context, settings) {
            var user_vue;
            $(".btn-select").on('click', function (event) {
                event.preventDefault();
                variation_id = $(this).data('variation_id');
                if (variation_id == undefined) {
                    $(this).unbind('click');
                    return true;
                }

                $('[name="product_variation"]').val(variation_id);
                $('#buy-form').submit();


            });



            if (drupalSettings.user_id != 0) {
                Dropzone.options.myEssayDropzone = {
                    url: "/wot/file_upload", // Set the url
                    previewsContainer: "#previews", // Define the container to display the previews
                    clickable: "#clickable", // Define the element that should be used as click trigger to select files.
                    acceptedFiles: "application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/pdf, text/plain, application/rtf, application/x-rtf, text/richtext",
                    paramName: "file",
                    maxFilesize: 2,
                    maxFiles: 1,
                    init: function () {
                        var prevFile;
                        this.on('addedfile', function (file) {
                            if (typeof prevFile !== 'undefined') {
                                this.removeFile(prevFile);
                            }
                            prevFile = file;
                        }),
                            this.on("sending", function (file, xhr, formData) {
                                formData.append("quiz_id", drupalSettings.quiz_id);
                            }),
                            this.on('success', function (file, responseText) {
                                prevFile = file;
                                $("#tutor_file").remove();

                                if(responseText.data.status === "Processing") {
                                    responseText.data.status = "Evaluating";
                                }
                                if (user_vue === undefined) {
                                   user_vue = new Vue({
                                        el: '#user_file',
                                        template: '#app-template',
                                        data: {
                                            file: responseText.data,
                                            caption: responseText.caption
                                        }
                                    });
                                } else {
                                    user_vue.file = responseText.data;
                                }

                                $('[name="wot_file_id"]').val(responseText.id);
                            });
                    }

                };
            }


        }
    };
})(jQuery, Drupal, drupalSettings);;
