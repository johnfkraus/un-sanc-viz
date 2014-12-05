function Document(docId, width) {

  var consoleLogDocument = true;
  var showingDoc = false,
    docClosePadding = 8,
    desiredDocsHeight = 200;

  var docId = docId;
  $("#doc").append("<div class='document' id='" + docId + "'></div>");
  var docContainer;
  /*
   if(width){
   $("#"+docId).css("width", width);
   }
   */
  // hideTooltip();
  hideDocument();

  var showDocument = function (content, event) {
    $("#" + docId).html(content);
//    $("#" + docId).show();
    $("#doc-container").show();
    resize(true);
  };

  function hideDocument() {
    $("#doc-container").hide();
    resize(false);
  }

  function resize(showDoc) {
    var docHeight = 0,
      svgHeight = 0,
      docContainer = $('#doc-container');
//      $svg = $('#svg'),
//      $close = $('#doc-close');

    if (typeof showDoc == 'boolean') {
      showingDoc = showDoc;
      docContainer[showDoc ? 'show' : 'hide']();
    }

    if (showingDoc) {
      docHeight = desiredDocsHeight;
      $('#doc-container').css('height', docHeight + 'px');
    }
    svgHeight = window.innerHeight - docHeight;
    if (consoleLogDocument) {
      console.log("\n window.innerHeight = ", window.innerHeight, "; docHeight = ",  docHeight, "; svgHeight = ", svgHeight);
    }
//  svgHeight = window.innerHeight - docHeight;

    $('#svg').css('height', svgHeight + 'px');

    $('#doc-close').css({
      top: svgHeight + docClosePadding + 'px',
      right: window.innerWidth - $('#doc-container')[0].clientWidth + docClosePadding + 'px'
    });
  }

  return {
    showDocument: showDocument,
    hideDocument: hideDocument,
    resize: resize
  }
}
