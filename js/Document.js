function Document(elementId) { // }, width) {

  var consoleLogDocument = true,
    that = this,
    showingDoc = false,
    docClosePadding = 8,
    desiredDocsHeight = 200,
    elementId,
    docContainer,
    topStuffHeight = $("#top-stuff").height();

  this.elementId = elementId;

  $("#doc-container").append("<div class='document'></div>");

  console.log("Document.js topStuffHeight = ", topStuffHeight);

  hideDocument();

  var showDocument = function (d, content, event) {
//  var showDocument = function (content, event, d) {
    var that = this;
    // elementId is "viz-doc"
    $("span#name").html(d.name);
    $("span#id").html(d.id);
    $("span#nameOriginalScript").html(d.NAME_ORIGINAL_SCRIPT);
    $("span#narrative").html(d.COMMENTS1);
//    $(".document").html(content);
    // $(".document").innerHTML = content
//    $("#" + docId).show();
    $("#doc-container").show();
    $("#doc-close").show();
    var qid = 'QI.D.232.07';
//    var selector = "['id'='QI.D.232.07']";
    this.d = d;
    //   vd = myNetwork.updateSearchIdLinkClick(qid);
    // var ddd = d3.select(selector);

    function makeDocLink(d) {
      return function () {
        console.log("d = ", d);
        console.log("d.id = ", d.id);
        $("#" + d.id).html(d.docs);
        $("#doc-container").show();
        $("#doc-close").show();
      }
    }

    var makeDocLink_d = makeDocLink(d);
//    console.log(add10(2)); // 12


    $('.document a').on('click', function () {
      // var ddd = d3.select(qid);
      return makeDocLink_d;
//      var d = that.d;
//      console.log('on click ' + d);
    });

    resize(true);
  };

  var clickLinkShowDocument = function (id, content, d) {
    var content = d.docs;
    // elementId = "viz-doc"
    $("#" + elementId).html(content);
    $("#doc-container").show();
    $("#doc-close").show();
    $('.document a').on('click', function (event, qid) {
      // var ddd = d3.select(qid);
      console.log("Document.js clickLinkShowDocument, onclick, qid = ", qid, "; d = ", d);
    });
    resize(true);
  };

  function hideDocument() {
    $("#doc-close").hide();
    $("#doc-container").hide();
    resize(false);
  }

  function resize(showDoc) {
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
//    svgHeight = window.innerHeight - docHeight;
    svgHeight = window.innerHeight - docHeight - topStuffHeight;

    if (consoleLogDocument) {
      console.log("; window.innerHeight = ", window.innerHeight, "; desiredDocsHeight = ", desiredDocsHeight, "; topStuffHeight = ", topStuffHeight, "; svgHeight = ", svgHeight);
      console.log("; window.innerWidth = ", window.innerWidth);
      console.log("\n window.innerHeight = ", window.innerHeight, "; docHeight = ", docHeight, "; svgHeight = ", svgHeight);
    }

    $('#svg').css('height', svgHeight + 'px');
//    $('svg').css('height', svgHeight + 'px');
    if (window.innerWidth < 900) {
      $('.mainTitleDiv').css('font-size', '14px');
    }
    $('#doc-close').css({
    //  top: svgHeight + docClosePadding + 'px',
      right: window.innerWidth - $('#doc-container')[0].clientWidth + docClosePadding + 'px'
    });
  }

  return {
    showDocument: showDocument,
    clickLinkShowDocument: clickLinkShowDocument,
    hideDocument: hideDocument,
    resize: resize
  }
}
