var observable = require("data/observable");
var fs = require('file-system');
var audio = require("nativescript-audio");
var permissions = require('nativescript-permissions');

var data = new observable.Observable({});
var recorder;

function onNavigatingTo(args) {
  var page = args.object;
  page.bindingContext = data;

  data.set('isRecording', false);
  data.set('isPaused', false);
}
exports.onNavigatingTo = onNavigatingTo;

/* START RECORDING */

function start(args) {

  permissions.requestPermission(android.Manifest.permission.RECORD_AUDIO, "Let me hear your thoughts...")
    .then(function () {

      // you should check if the device has recording capabilities
      if (audio.TNSRecorder.CAN_RECORD()) {

        recorder = new audio.TNSRecorder();

        var audioFolder = fs.knownFolders.currentApp().getFolder("audio");

        var recorderOptions = {

          filename: audioFolder.path + '/recording.mp3',
          infoCallback: function () {
            console.log('infoCallback');
          },
          errorCallback: function () {
            console.log('errorCallback');
            alert('Error recording.');
          }
        };

        console.log('RECORDER OPTIONS: ' + recorderOptions);

        recorder.start(recorderOptions).then(function (res) {
          data.set('isRecording', true);
        }, function (err) {
          data.set('isRecording', false);
          console.log('ERROR: ' + err);
        });

      } else {
        alert('This device cannot record audio.');
      }

    })
    .catch(function () {
      console.log("Uh oh, no permissions - plan B time!");
    });
}
exports.start = start;

/* STOP RECORDING */

function stop(args) {
  if (recorder != undefined) {
    recorder.stop().then(function () {
      data.set('isRecording', false);
      alert('Audio Recorded Successfully.');
    }, function (err) {
      console.log(err);
      data.set('isRecording', false);
    });
  }
}
exports.stop = stop;

/* PAUSE RECORDING */

function pause(args) {
  if (recorder != undefined) {
    recorder.pause().then(function () {
      data.set('isRecording', false);
      data.set('isPaused', true);
      console.log("Recording paused");
    }, function (err) {
      console.log(err);
      data.set('isRecording', false);
      data.set('isPaused', false);
    });
  }
}
exports.pause = pause;

/* RESUME RECORDING */

function resume(args) {
  if (recorder != undefined) {
    recorder.resume().then(function () {
      data.set('isRecording', true);
      data.set('isPaused', false);
      console.log("Recording resumed");
    }, function (err) {
      console.log(err);
      data.set('isRecording', false);
      data.set('isPaused', true);
    });
  }
}
exports.resume = resume;

function getFile(args) {
  try {
    var audioFolder = fs.knownFolders.currentApp().getFolder("audio");
    var recordedFile = audioFolder.getFile('recording.mp3');
    data.set("recordedAudioFile", recordedFile.path);
    console.log("Playing file...");
    let player = new audio.TNSPlayer();
    player.playFromFile({ audioFile: recordedFile.path, loop: false });
  } catch (ex) {
    console.log(ex);
  }
}
exports.getFile = getFile;