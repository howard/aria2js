//------------------------------------------------------------------------------
//
// Data container objects:
//
//------------------------------------------------------------------------------

var GlobalOptions = {
  /*download-result: "default",
  //log: null, //TODO
  log-level: "debug",
  max-concurrent-downloads: "5",
  max-download-result: "1000",
  max-overall-download-limit: "0",
  max-overall-upload-limit: "0",
  save-cookies: "",
  save-session: "",
  server-stat-of: ""*/
};

var DataContainerFactory = {
  createDownloadOptions: function (callback, btMaxPeers, btRequestPeerSpeedLimit,
          btRemoveUnselectedFile, maxDownloadLimit, maxUploadLimit) {
    var retVal = {};
    if (btMaxPeers) retVal["bt-max-peers"] = btMaxPeers;
    if (btRequestPeerSpeedLimit) retVal["bt-request-peer-speed-limit"] = btRequestPeerSpeedLimit;
    if (btRemoveUnselectedFile) retVal["bt-remove-unselected-file"] = btRemoveUnselectedFile;
    if (maxDownloadLimit) retVal["bt-max-download-limit"] = maxDownloadLimit;
    if (maxUploadLimit) retVal["max-upload-limit"] = maxUploadLimit;

    return retVal;
  }
};


//------------------------------------------------------------------------------
//
// Aria2 RPC API proxy:
//
//------------------------------------------------------------------------------

var Aria2RPC = {
 init: function (callback, userName, password, host, port) {
    this.userName = userName ? userName : "aria2";
    this.password = password ? password : "aria2";
    this.setHostPort(host, port);

    // Ping aria2 to check if everything works:
    $.getJSON(this._url, {id: "aria2js", method: "aria2.getGlobalOption"}, function () {
      if (callback) callback(true);
    }).error(function() {
      if (callback) callback(false);
    });
  },

  setHostPort: function (host, port) {
    this.host = host ? host : "holo";
    this.port = port ? port : "6800";
    this._url = "http://" + this.host + ":" + this.port + "/jsonrpc";
  },

  _send: function (methodName, paramsArray, callback) {
    var requestData = {
      id: "aria2js",
      method: methodName
    };
    if (paramsArray)
      requestData.params = /*escape(*/$.base64.encode(JSON.stringify(paramsArray))/*)*/;

    $.getJSON(this._url, requestData, callback)
      .error(function() { console.log("An error occured."); });
  },


  //----------------------------------------------------------------------------
  // RPC API proxy methods:
  //----------------------------------------------------------------------------

  /**
   * Adds a new download, specified by an URI, to the download queue.
   * 
   * @param {function}  callback  Callback function receiving the download's ID.
   * @param {String[]}  uris      Array of URIs specifying the download source.
   * @param {Object}    options   Download options. Optional.
   * @param {int}       position  Position in download queue; last by default. Optional.
   */
  addUri: function (callback, uris, options, position) {
    var params = [uris];
    if (options) {
      params.push(options);
      if (position) {
        params.push(position);
      }
    }
    console.log($.base64.encode(JSON.stringify(params)))

    this._send("aria2.addUri", params, function (data) {
      if (callback) callback(data.result);
    });
  },

  /**
   * Adds a new download, specified by a torrent file, to the download queue.
   * 
   * @param {function}  callback  Callback function receiving the download's GID.
   * @param {Object}    torrentFile Torrent file to be used.
   * @param {String[]}  uris      asd
   * @param {Object}    options   Download options. Optional.
   * @param {int}       position  Position in download queue; last by default. Optional.
   */
  addTorrent: function (callback, torrentFile, uris, options, position) {
    var params = [$.base64.encode(torrentFile)];
    if (uris) {
      params.push(uris);
      if (options) {
        params.push(options);
        if (position) {
          params.push(position);
        }
      }
    }

    this._send("aria2.addTorrent", params, function (data) {
      if (callback) callback(data.result);
    });
  },

  addMetalink: function (callback, metalinkFile, options, position) {
    var params = [$.base64.encode(metalinkFile)];
    if (options) {
      params.push(options);
      if (position) {
        params.push(position);
      }
    }

    this._send("aria2.addMetalink", params, function (data) {
      if (callback) callback(data.result);
    });
  },

  /**
   * @param {function}  callback  Callback function receiving the removed
   *                              download's GID.
   * @param {Number|String} id    GID of the download to be removed.
   */
  remove: function (callback, id) {
    this._send("aria2.remove", [id.toString()], function (data) {
      if (callback) callback(data.result);
    });
  },

  forceRemove: function (callback, id) {
    this._send("aria2.forceRemove", [id.toString()], function (data) {
      if (callback) callback(data.result);
    });
  },

  pause: function (callback, id) {
    this._send("aria2.pause", [id.toString()], function (data) {
      if (callback) callback(data.result);
    });
  },

  pauseAll: function (callback) {
    this._send("aria2.pauseAll", null, function (data) {
      if (callback) callback(data.result == "OK");
    });
  },

  forcePause: function (callback, id) {
    this._send("aria2.forcePause", [id.toString()], function (data) {
      if (callback) callback(data.result);
    });
  },

  forcePauseAll: function (callback) {
    this._send("aria2.forcePauseAll", null, function (data) {
      if (callback) callback(data.result == "OK");
    });
  },

  unpause: function (callback, id) {
    this._send("aria2.unpause", [id.toString()], function (data) {
      if (callback) callback(data.result);
    });
  },

  unpauseAll: function (callback) {
    this._send("aria2.unpauseAll", null, function (data) {
      if (callback) callback(data.result == "OK");
    });
  },

  tellStatus: function (callback, id, keys) {
    var params = [id.toString()];
    if (keys) params.push(keys);
    this._send("aria2.tellStatus", params, function (data) {
      if (callback) callback(data.result);
    });
  },

  getUris: function (callback, id) {
    this._send("aria2.getUris", [id.toString()], function (data) {
      if (callback) callback(data.result);
    });
  },

  getFiles: function (callback, id) {
    this._send("aria2.getFiles", [id.toString()], function (data) {
      if (callback) callback(data.result);
    });
  },

  getPeers: function (callback, id) {
    this._send("aria2.getPeers", [id.toString()], function (data) {
      if (callback) callback(data.result);
    });
  },

  getServers: function (callback, id) {
    this._send("aria2.getServers", [id.toString()], function (data) {
      if (callback) callback(data.result);
    });
  },

  tellActive: function (callback, keys) {
    var params = (keys ? keys : null);
    this._send("aria2.tellActive", params, function (data) {
      if (callback) callback(data.result);
    });
  },

  tellWaiting: function (callback, offset, num, keys) {
    var params = [offset, num];
    if (keys) params.push(keys);
    this._send("aria2.tellWaiting", params, function (data) {
      if (callback) callback(data.result);
    });
  },

  tellStopped: function (callback, offset, num, keys) {
    var params = [offset, num];
    if (keys) params.push(keys);
    this._send("aria2.tellStopped", params, function (data) {
      if (callback) callback(data.result);
    });
  },

  // Callback receives new position.
  increasePosition: function (callback, id) {
    this.changePosition(callback, id, 1, "POS_CUR");
  },

  // Callback receives new position.
  decreasePosition: function (callback, id) {
    this.changePosition(callback, id, -1, "POS_CUR");
  },

  // Callback receives new position.
  changePosition: function (callback, id, pos, how) {
    var params = [id.toString(), pos, how];
    this._send("aria2.changePosition", params, function (data) {
      if (callback) callback(data.result);
    });
  },

  changeUri: function (callback, id, fileIndex, delUris, addUris, position) {
    var params = [id.toString(), fileIndex, delUris, addUris];
    if (position)
      params.push(position);
    this._send("aria2.changeUri", params, function (data) {
      if (callback) callback(data.result);
    });
  },

  getOptions: function (callback, id) {
    this._send("aria2.getOption", [id.toString()], function (data) {
      if (callback) callback(data.result);
    });
  },

  // Callback is supplied with boolean success indicator.
  changeOptions: function (callback, id, options) {
    this._send("aria2.changeOption", [id.toString(), options], function (data) {
      if (callback) callback(data.result == "OK");
    });
  },

  // Callback is supplied with an object containing global options.
  getGlobalOptions: function (callback) {
    this._send("aria2.getGlobalOption", null, function (data) {
      if (callback) callback(data.result);
    });
  },

  //TODO
  /**
   * @param options GlobalOptions Data container with the desired options set.
   */
  // Callback is supplied with boolean success indicator.
  changeGlobalOptions: function (callback, options) {
    this._send("aria2.changeGlobalOption", [options], function (data) {
      if (callback) callback(data.result == "OK");
    });
  },

  // Callback is supplied with an object containing various statistical data.
  getGlobalStat: function (callback) {
    this._send("aria2.getGlobalStat", null, function (data) {
      if (callback) callback(data.result);
    });
  },

  // Callback is supplied with boolean success indicator.
  purgeDownloadResult: function (callback) {
    this._send("aria2.purgeDownloadResult", null, function (data) {
      if (callback) callback(data.result == "OK");
    });
  },

  //TODO
  // Callback is supplied with boolean success indicator.
  removeDownloadResult: function (callback, id) {
    //TODO
    this._send("aria2.removeDownloadResult", null, function (data) {
      if (callback) callback(data.result == "OK");
    })
  },

  // Callback is supplied with an object containing the enabled features and the
  // version string.
  getVersion: function (callback) {
    this._send("aria2.getVersion", null, function (data) {
      if (callback) callback(data.result);
    });
  },

  // Callback is supplied with the session ID.
  getSessionInfo: function (callback) {
    this._send("aria2.getSessionInfo", null, function (data) {
      if (callback) callback(data.result.sessionId);
    });
  },

  // Callback is supplied with a boolean value, indicating whether shutdown was
  // successful or not.
  shutdown: function (callback) {
    this._send("aria2.shutdown", null, function (data) {
      if (callback) callback(data.result == "OK");
    });
  },

  // Callback is supplied with a boolean value, indicating whether shutdown was
  // successful or not.
  forceShutdown: function (callback) {
    this._send("aria2.forceShutdown", null, function (data) {
      if (callback) callback(data.result == "OK");
    });
  }
};