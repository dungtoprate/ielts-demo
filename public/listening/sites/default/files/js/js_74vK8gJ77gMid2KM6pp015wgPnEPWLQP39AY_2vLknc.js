(function () {

  'use strict';

  Drupal.behaviors.lazy = {
    attach: function (context, settings) {
      var options = settings.lazy ? settings.lazy : {};
      new Blazy(options);
    }
  };

})();
;
