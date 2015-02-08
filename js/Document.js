function Document() { // }, width) {

  var consoleLogDocument = true,
    that = this,
    showingDoc = false,
    docClosePadding = 8,
    desiredDocsHeight = 200,
    topStuffNegativeMargin = 10,
    docContainer,
    topStuffHeight = $('#top-stuff').height();

//  this.elementId = elementId;
//  console.log('Document.js topStuffHeight = ', topStuffHeight);

  hideDocument();

  var showDocument = function (d, content, event) {
//  var showDocument = function (content, event, d) {
    var that = this;
    // elementId is 'viz-doc'
    $('span#name').html('Document.js'+d.name);
    $('span#id').html(d.id);
    $('span#nameOriginalScript').html(d.NAME_ORIGINAL_SCRIPT);
    $('span#narrative').html(d.COMMENTS1);
    if (d.indiv0OrEnt1 == 0 && d.INDIVIDUAL_DATE_OF_BIRTH !== 'undefined') {
      $('span#indivDob').html(d.INDIVIDUAL_DATE_OF_BIRTH);

    } else {
//   $('div#dateOfBirthDiv').css('display', 'none');
    }

    $('#doc-container').show();
    $('#doc-close').css('display', 'inline');
    this.d = d;
    resize(true);
  };

  function hideDocument() {
    $('#doc-close').css('display', 'none');
//    $('#doc-close').hide();
    $('#doc-container').hide();
    resize(false);
  }

  function resize(showDoc) {
    console.log('Document.js 51 resize(showDoc = ', showDoc, ')');
    var docHeight = 0,
      svgHeight = 0,
      docContainer = $('#doc-container'),
      docClose = $('#doc-close');

    if (typeof showDoc == 'boolean') {
      showingDoc = showDoc;
      docContainer[showDoc ? 'show' : 'hide']();
      docClose[showDoc ? 'show' : 'hide']();
    }
    if (showingDoc) {
      docHeight = desiredDocsHeight;
      $('#doc-container').css('height', docHeight + 'px');
    }
    svgHeight = window.innerHeight - docHeight - $('#top-stuff').height() + topStuffNegativeMargin;
    $('#svg').css('height', svgHeight + 'px');
    if (window.innerWidth < 900) {
      $('.mainTitleDiv').css('font-size', '14px');
    }
    $('#doc-close').css({
     //  right: window.innerWidth - $('#doc-container')[0].clientWidth + docClosePadding + 'px'
    });
    if (consoleLogDocument) {
      console.log('Document.js window.innerHeight = ', window.innerHeight, '; desiredDocsHeight = ', desiredDocsHeight, '; topStuffHeight = ', $('#top-stuff').height(), '; svgHeight = ', svgHeight,'\nwindow.innerWidth = ', window.innerWidth, '; docHeight = ', docHeight);
    }
  }

  return {
    showDocument: showDocument,
    hideDocument: hideDocument,
    resize: resize
  }
}
