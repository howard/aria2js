var Aria2 = {
  _connected: false,
  _statusPoll: null,
  _globalStatusPoll: null,

  _statusListUpdater: function (dlDescriptors) {
    for (i in dlDescriptors) {
      // Add or replace entries:
      Aria2.downloads[parseInt(dlDescriptors[i].gid)] = dlDescriptors[i];
    }
  },

  _globalStatusUpdater: function (statusObject) {
    Aria2.status.downloadRate = statusObject.downloadSpeed;
    Aria2.status.uploadRate = statusObject.uploadSpeed;
    Aria2.status.activeCount = statusObject.numActive;
    Aria2.status.stoppedCount = statusObject.numStopped;
    Aria2.status.waitingCount = statusObject.numWaiting;
  },

  /**
   * Download objects, indexed by GID.
   */
  downloads: [],

  /**
   * Global status properties.
   */
  status: {
    downloadRate: 0.0,
    uploadRate: 0.0,
    activeCount: 0,
    stoppedCount: 0,
    waitingCount: 0
  },

  /**
   * Version-specific capabilities.
   */
  version: 0.0,
  features: [],

  /**
   * Session-related information.
   */
  sessionID: "n/a",


  /**
   * Called after the updated download lists have been fetched from the server
   * and organized.
   * 
   * @param {Object[]} Array of download descriptors in any state.
   */
  onStatusListUpdate: function (dlDescriptors) {},

  /**
   * Called after the global status has been processed and updated.
   */
  onGlobalStatusUpdate: function () {},

  connect: function () {
    // Initialize and check for success. Perform initialization of repeated
    // status fetching only if connection was successful.
    Aria2RPC.init(function (success) {
      if (success) {
        Aria2._connected = true;
        Aria2._statusPoll = setInterval(Aria2.update, 1000);

        Aria2RPC.getVersion(function (versionInfo) {
          Aria2.version = versionInfo.version;
          Aria2.features = versionInfo.enabledFeatures;
        });
        Aria2RPC.getSessionInfo(function (sessionID) {
          Aria2.sessionID = sessionID;
        });

        log("[aria2] Server connection established.");
      
      } else {
        log("[aria2] Unable to connect to server.");
      }
    });
  },

  /**
   * Cleans up internal data structures and stops polling mechanisms.
   */
  disconnect: function () {
    Aria2._connected = false;
    clearInterval(Aria2._statusPoll);
    Aria2.downloads = [];
    Aria2.status = {
      downloadRate: 0.0,
      uploadRate: 0.0,
      activeCount: 0,
      stoppedCount: 0,
      waitingCount: 0
    };
    Aria2.version = 0.0;
    Aria2.features = [];
    Aria2.sessionID = "n/a";
  },

  shutdown: function (callback) {
    if (!Aria2._connected) {
      callback(false);
    } else {
      Aria2.disconnect();
      Aria2RPC.shutdown();
      callback(true);
    }
  },

  /**
   * Normally no need to call manually, as the data is updated periodically
   * anyway. Calling this method forces an update of the locally cached aria2
   * status information, including downloads and global status.
   */
  update: function () {
    Aria2RPC.tellActive(Aria2._statusListUpdater, 0, 100);// TODO: ugly fetching numbers
    Aria2RPC.tellWaiting(Aria2._statusListUpdater, 0, 100);
    Aria2RPC.tellStopped(Aria2._statusListUpdater, 0, 100);
    // Notify client:
    Aria2.onStatusListUpdate(Aria2.downloads);

    // Fetch global status:
    Aria2RPC.getGlobalStat(Aria2._globalStatusUpdater);
    // Notify client:
    Aria2.onGlobalStatusUpdate();
  },

  /**
   * Resumes a download specified by its gid, or all downloads, if no gid is
   * specified. If a download is already running, no change to its state is made.
   */
  resume: function (gid) {
    if (gid)
      Aria2RPC.unpause(null, gid);
    else
      Aria2RPC.unpauseAll(null);
  },

  /**
   * Pauses a download specified by its gid, or all downloads, if no gid is
   * specified. If a download is already paused, no change to its state is made.
   */
  pause: function (gid) {
    if (gid)
      Aria2RPC.pause(null, gid);
    else
      Aria2RPC.pauseAll(null);
  },

  /**
   * Removes a download specified by its gid from the download queue.
   */
  remove: function (gid) {
    Aria2RPC.remove(null, gid);
  }
};