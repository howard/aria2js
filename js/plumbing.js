//------------------------------------------------------------------------------
//
// Interaction handlers.
//
//------------------------------------------------------------------------------

/**
 * Reverts the GUI to a neutral state, clearing stats and lists. Called on
 * disconnects and shutdowns.
 */
var resetGui = function () {
  $('#download-rate').html('n/a');
  $('#upload-rate').html('n/a');
  $('#downloads').accordion('destroy');
  $('#downloads').empty();
};

var showNewDownloadForm = function () {
  $('#new-download-dialog').dialog({
    draggable: false,
    modal: true,
    resizable: false,
    width: 400
  });
};

var showSettings = function () {
  //TODO
};

var showInfo = function () {
  var elem = $('#info-dialog');
  $('#info-aria2-version').html(Aria2.version);
  $('#info-url').html(Aria2RPC._url);

  $('#info-features').empty();
  for (i in Aria2.features) {
    $('#info-features').append('<li>' + Aria2.features[i] + '</li>');
  }

  $('#info-session-id').html(Aria2.sessionID);

  elem.dialog({
    draggable: false,
    modal: true,
    resizable: false,
    width: 400
  });
};

var doShutdown = function () {
  Aria2.shutdown(function (success) {
    // Show on screen that there no longer is a connection.
    if (success)
      alert('You have shut down the aria2 server successfully.');
    else
      alert('An error happened while shutting down aria2. Check the logs for more information.');
    resetGui();
  });
};

var doResume = function (evt) {
  var gid = evt.currentTarget.parentNode.parentNode.parentNode.id.split('gid')[1];
  Aria2.resume(gid);
};

var doPause = function (evt) {
  var gid = evt.currentTarget.parentNode.parentNode.parentNode.id.split('gid')[1];
  Aria2.pause(gid);
};

var doRemove = function (evt) {
  var gid = evt.currentTarget.parentNode.parentNode.parentNode.id.split('gid')[1];
  Aria2.remove(gid);
};

var uploadDroppedFiles = function (evt) {
  console.log(evt);
};



//------------------------------------------------------------------------------
//
// GUI Updates.
//
//------------------------------------------------------------------------------

var updateDownloadsAccordion = function (downloads) {

  // Insert HTML of new downloads and update existing ones:
  for (i in downloads) {
    var progress = downloads[i].completedLength / downloads[i].totalLength;
    var name = downloads[i].files[0].path.split(downloads[i].dir)[1].substring(1);

    // Add new entry if download not present yet:
    var gidId = '#gid' + downloads[i].gid;
    var elem = $(gidId);
    var accordionRebuildRequired = false;
    if (elem.length < 1) {
      elem = $('#download-item').clone();
      elem.attr('id', 'gid' + downloads[i].gid);
      elem.removeClass('template');
      elem.appendTo('#downloads');
      accordionRebuildRequired = true;

      // UI stuff:
      $(gidId + ' .progress-bar').progressbar();

      // Add handling functions for the controls:
      $(gidId + ' .resume-button').click(doResume);
      $(gidId + ' .pause-button').click(doPause);
    }

    // Update download infos:
    $(gidId + ' .progress-bar').progressbar('value', progress * 100);
    $(gidId + ' .download-name').html(downloads[i].files[0].path);
    $(gidId + ' .download-rate').html(humanizeBytes(downloads[i].downloadSpeed, 2) + '/s');
    $(gidId + ' .upload-rate').html(humanizeBytes(downloads[i].uploadSpeed, 2) + '/s');
    $(gidId + ' .download-progress-value').html((progress * 100).toFixed(1));

    $(gidId + ' .accordion-expansion').empty();
    $(gidId + ' .accordion-expansion').append('<h3>Network:</h3><ul>' +
        '<li><strong>Status:</strong> ' + downloads[i].status + '</li>' +
        '<li><strong>Downloaded:</strong> ' + humanizeBytes(downloads[i].completedLength, 2) + '</li>' +
        '<li><strong>Uploaded:</strong> ' + humanizeBytes(downloads[i].uploadLength, 2) + '</li>' +
        '<li><strong>Total Size:</strong> ' + humanizeBytes(downloads[i].totalLength, 2) + '</li>' +
        '<li><strong>Connections:</strong> ' + downloads[i].connections + '</li>' +
      '</ul>');
    $(gidId + ' .accordion-expansion').append('<h3>Files:</h3><ul class="file-list"></ul>');
    var fileList = $(gidId + ' .file-list');
    for (j in downloads[i].files) {
      var file = downloads[i].files[j];
      var fileName = file.path.split(downloads[i].dir)[1].substring(1);
      $(gidId + ' .file-list').append('<li><strong>' + fileName + ':</strong> ' +
        'Downloaded ' + humanizeBytes(file.completedLength, 2) +
        ' of ' + humanizeBytes(file.length, 2) +
        ' (' + ((file.completedLength / file.length) * 100).toFixed(1) + ' % complete)' +
        '</li>');
    }



    // Add new entry if download not present yet:
    /*if ($('#gid' + downloads[i].gid).length < 1) {
      $('#downloads').append(
        '<div id="gid' + downloads[i].gid + '" class="download"></div>');
    }

    // Now, update the data:
    $('#gid' + downloads[i].gid).empty().append('<div class="accordion-header"><div class="download-name">' +
        downloads[i].files[0].path + 
        '</div><div class="progress-bar">&nbsp;</div></div>' +
      '<div>' + 'asdasdas' + 
      '</div>');
    // Update progress bar:
    $('#gid' + downloads[i].gid + ' > div > .progress-bar').progressbar();
    $('#gid' + downloads[i].gid + ' > div > .progress-bar').progressbar('value', progress * 100);*/
  }

  // Destroy and rebuild, if necessary:
  if (accordionRebuildRequired) {
    $('#downloads').accordion('destroy').accordion({
      active: (selectedDownloadIndex > -1 ? selectedDownloadIndex : false),
      autoHeight: false,
      changestart: function(event, ui) {
        selectedDownloadIndex = $('#downloads').children().index('#' + ui.newHeader.parent().attr('id'));
      },
      clearStyle: false,
      collapsible: true,
      header: '.accordion-header'
    });
  }
};


var updateGlobalStats = function () {
  // Update global transfer rates:
  $('#download-rate').html(humanizeBytes(Aria2.status.downloadRate, 2) + '/s');
  $('#upload-rate').html(humanizeBytes(Aria2.status.uploadRate, 2) + '/s');
};



//------------------------------------------------------------------------------
//
// Initialization.
//
//------------------------------------------------------------------------------

var selectedDownloadIndex = -1;


$(document).ready(function () {
  Aria2.onStatusListUpdate = updateDownloadsAccordion;
  Aria2.onGlobalStatusUpdate = updateGlobalStats;
  Aria2.connect();

  // Associate controls with actions:
  $('#resume-all-button').click(function () { Aria2.resume(); });
  $('#pause-all-button').click(function () { Aria2.pause(); });
  $('#open-button').click(showNewDownloadForm);
  $('#refresh-button').click(Aria2.update);
  $('#settings-button').click(showSettings);
  $('#info-button').click(showInfo);
  $('#shutdown-button').click(doShutdown);

  $('#drop-zone').bind('drop', uploadDroppedFiles);
  $('#drop-zone').bind('dragover', function (evt) {
    console.log(evt);
  });
});