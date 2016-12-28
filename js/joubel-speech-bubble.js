var H5P = H5P || {};

/**
 * Class responsible for creating speech bubbles
 */
H5P.JoubelSpeechBubble = (function ($) {

  var $currentSpeechBubble;
  var $currentContainer;
  var removeSpeechBubbleTimeout;

  var DEFAULT_MAX_WIDTH = 400;

  var iDevice = navigator.userAgent.match(/iPod|iPhone|iPad/g) ? true : false;

  /**
   * Creates a new speech bubble
   *
   * @param {H5P.jQuery} $container The speaking object
   * @param {string} text The text to display
   * @param {number} maxWidth The maximum width of the bubble
   * @return {H5P.JoubelSpeechBubble}
   */
  function JoubelSpeechBubble($container, text, maxWidth) {
    maxWidth = maxWidth || DEFAULT_MAX_WIDTH;
    $currentContainer = $container;

    this.isCurrent = function ($tip) {
      return $tip === $currentContainer;
    };

    this.remove = function () {
      remove();
    };

    var fadeOutSpeechBubble = function ($speechBubble) {
      if (!$speechBubble) {
        return;
      }

      // Stop removing bubble
      clearTimeout(removeSpeechBubbleTimeout);

      $speechBubble.removeClass('show');
      setTimeout(function () {
        if ($speechBubble) {
          $speechBubble.remove();
          $speechBubble = undefined;
        }
      }, 500);
    };

    if ($currentSpeechBubble !== undefined) {
      remove();
    }

    $(window).resize(function() {
      remove();
    });

    var $h5pContainer = $container.closest('.h5p-frame');

    // Check closest h5p frame first, then check for container in case there is no frame.
    if (!$h5pContainer.length) {
      $h5pContainer = $container.closest('.h5p-container');
    }

    // Make sure we fade out old speech bubble
    fadeOutSpeechBubble($currentSpeechBubble);

    $currentSpeechBubble = $('<div/>', {
      'class': 'joubel-speech-bubble'
    })
      .append($('<div/>', {
        'class': 'joubel-speech-bubble-inner'
      })
      .append($('<div/>', {
        'class': 'joubel-speech-bubble-text',
        'text': text
      }))
    ).appendTo($h5pContainer);

    // Show speech bubble with transition
    setTimeout(function () {
      $currentSpeechBubble.addClass('show');
    }, 0);

    // If width is more than max width, use max width
    var width = $h5pContainer.width() > maxWidth ? maxWidth : $h5pContainer.width();

    var containerOffsetLeft = $container.offset().left - $h5pContainer.offset().left;
    var containerOffsetRight = $h5pContainer.width() - ($container.offset().left + $container.width() - $h5pContainer.offset().left);

    // Position the way with most free space
    if (containerOffsetLeft > containerOffsetRight) {
      $currentSpeechBubble.direction = 'left';
      if (width > containerOffsetLeft) {
        width = containerOffsetLeft;
      }
      containerOffsetRight += ($container.width() / 2) - 18;
      $currentSpeechBubble.css('right', containerOffsetRight);
    }
    else {
      $currentSpeechBubble.direction = 'right';
      if (width > containerOffsetRight) {
        width = containerOffsetRight;
      }
      containerOffsetLeft += ($container.width() / 2) - 18;
      $currentSpeechBubble.css('left', containerOffsetLeft);
    }

    $currentSpeechBubble.addClass('direction-' + $currentSpeechBubble.direction);

    // Need to set font-size, since element is appended to body.
    // Using same font-size as parent. In that way it will grow accordingly
    // when resizing
    var fontSize = 16;

    $currentSpeechBubble.css({
      width: width + 'px',
      top: ($container.offset().top + $container.outerHeight() - $h5pContainer.offset().top) + 'px',
      fontSize: fontSize + 'px'
    });

    // Handle click to close
    H5P.$body.on('mousedown.speechBubble', handleOutsideClick);

    // Handle clicks when inside IV which blocks bubbling.
    $container.parents('.h5p-dialog')
      .on('mousedown.speechBubble', handleOutsideClick);

    if (iDevice) {
      H5P.$body.css('cursor', 'pointer');
    }

    return this;
  }

  // Remove speechbubble if it belongs to a dom element that is about to be hidden
  H5P.externalDispatcher.on('domHidden', function (event) {
    if ($currentSpeechBubble !== undefined && event.data.$dom.find($currentContainer).length !== 0) {
      remove();
    }
  });

  /**
   * Static function for removing the speechbubble
   */
  var remove = function() {
    H5P.$body.off('mousedown.speechBubble');
    $currentContainer.parents('.h5p-dialog').off('mousedown.speechBubble');
    if (iDevice) {
      H5P.$body.css('cursor', '');
    }
    if ($currentSpeechBubble !== undefined) {
      // Apply transition, then remove speech bubble
      $currentSpeechBubble.removeClass('show');

      // Make sure we remove any old timeout before reassignment
      clearTimeout(removeSpeechBubbleTimeout);
      removeSpeechBubbleTimeout = setTimeout(function () {
        $currentSpeechBubble.remove();
        $currentSpeechBubble = undefined;
      }, 500);
    }
    // Don't return false here. If the user e.g. clicks a button when the bubble is visible,
    // we want the bubble to disapear AND the button to receive the event
  }

  /**
   * Remove the speech bubble with a fade
   *
   * @param {jQuery} $speechBubble Speech bubble element
   */
  function fadeOutSpeechBubble($speechBubble) {
    if (!$speechBubble) {return;}

    // Stop removing bubble
    clearTimeout(removeSpeechBubbleTimeout);

    $speechBubble.removeClass('show');
    setTimeout(function () {
      if ($speechBubble) {
        $speechBubble.remove();
        $speechBubble = undefined;
      }
    }, 500);
  }

  /**
   * Remove the speech bubble and container reference
   */
  function handleOutsideClick () {
    remove();
    // There is no current container when a container isn't clicked
    $currentContainer = undefined;
  }

  return JoubelSpeechBubble;
})(H5P.jQuery);
