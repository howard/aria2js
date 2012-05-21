//------------------------------------------------------------------------------
//
// GUI Updates.
//
//------------------------------------------------------------------------------

var updateDownloadsAccordion = function (downloads) {

  // Insert HTML of new downloads:
  for (i in downloads) {
    var progress = downloads[i].completedLength / downloads[i].totalLength;

    // Add new entry if download not present yet:
    if ($('#gid' + downloads[i].gid).length < 1) {
      $('#downloads').append(
        '<div id="gid' + downloads[i].gid + '" class="download"></div>');
    }

    // Now, update the data:
    $('#gid' + downloads[i].gid).empty().append('<h3>' + downloads[i].files[0].path + 
        '<div class="progress-bar" style="width: ' +
        (progress * 100).toFixed(0) + '%">&nbsp;</div></h3>' +
      '<div>' + 'asdasdas' + 
      '</div>');
  }

  // Destroy and rebuild:
  $('#downloads').accordion('destroy').accordion({
    active: (selectedDownloadIndex > -1 ? selectedDownloadIndex : false),
    autoHeight: false,
    changestart: function(event, ui) {
      selectedDownloadIndex = $('#downloads').children().index('#' + ui.newHeader.parent().attr('id'));
    },
    clearStyle: false,
    collapsible: true,
    header: 'h3'
  });
};


var updateGlobalStats = function () {
  // Update global transfer rates:
  $('#download-rate').html(humanizeBytes(Aria2.status.downloadRate, 2) + '/s');
  $('#upload-rate').html(humanizeBytes(Aria2.status.uploadRate, 2) + '/s');
};



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
  // Make only viable options visible:
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



  /*$('#myDownloads').accordion({
    active: false,
    autoHeight: false,
    clearStyle: true,
    collapsible: true
  });

  var statusPoll = setInterval(function () {
    Aria2RPC.tellWaiting(function (data) {

      $('#downloads').empty();
      for (i in data) {
        var progress = data[i].completedLength / data[i].totalLength;
        $('#sownloads').append(
          '<div id="gid' + data[i].gid + '" class="download"><h3>' + data[i].files[0].path + 
            '<div class="progressBar" style="width: ' +
            (progress * 100).toFixed(0) + '%">&nbsp;</div></h3>' +
          '<div>' + 'asdasdas' + 
          '</div></div>'
        );
      }
      $('#myDownloads').accordion('destroy').accordion({
        active: false,
        autoHeight: false,
        clearStyle: false,
        collapsible: true,
        header: 'h3'
      });





      $('#downloadsData').empty();
      for (i in data) {
        var progress = data[i].completedLength / data[i].totalLength;
        $('#downloadsData').append(
          '<tr><td>' + data[i].status + '</td>' +
          '<td>' + data[i].gid + '</td>' +
          '<td>' + data[i].files[0].path + '</td>' +
          '<td class="progress">' + '<div class="progressBar" style="width: ' + (progress * 100).toFixed(0) + '%">&nbsp;</div>' + (100 * progress).toFixed(2) + ' %</td></tr>'
        );
      }
    }, 0, 100);

    Aria2RPC.tellActive(function (data) {
      for (i in data) {
        var progress = data[i].completedLength / data[i].totalLength;
        $('#downloadsData').append(
          '<tr><td>' + data[i].status + '</td>' +
          '<td>' + data[i].gid + '</td>' +
          '<td>' + data[i].files[0].path + '</td>' +
          '<td class="progress">' + '<div class="progressBar" style="width: ' + (progress * 100).toFixed(0) + '%">&nbsp;</div>' + (100 * progress).toFixed(2) + ' %</td></tr>'
        );
      }
    }, 0, 100);
  }, 1000);*/
});