// tutorial: https://www.html5rocks.com/en/tutorials/webrtc/basics/

// elements
let videoPlayer = document.querySelector('#video-player');
let videoPlayer2 = document.querySelector('#video-player-2');

// step 1: get user media (audio and/or video)
function handleError(err) {
  console.log(err);
}
navigator.getUserMedia({
  video: {
    optional: [
      { minFrameRate: 60 },
      { maxWidth: 500 },
      { maxHeight: 300 }
    ]
  },
  audio: false
}, startRTC, handleError);

// (client side is pc2)
let pc2 = new RTCPeerConnection();
pc2.getIceCandidate = function(candidate) {
  if(candidate == null) {
    console.log('ice candidate gathering finished');
    return;
  }
  console.log('testing 7 ' + candidate);
  pc2.addIceCandidate(candidate)
    .catch(function(error) {
      console.log(error);
    });
};
pc2.setDescription = function(desc) {
  console.log('testing 6', desc);
  pc2.setRemoteDescription(new RTCSessionDescription(desc));

  // now send answer
  pc2.createAnswer()
    .then(function(answer) {
      pc2.setLocalDescription(answer);
      pc.setDescription(answer);
    })
    .catch(function(error) {
      console.log(error);
    });
}
// once stream arrives, show it in remote video element
pc2.ontrack = function(event) {
  console.log('test 17 1');
  videoPlayer2.srcObject = event.streams[0];
}
pc2.onaddstream = function(event) {
  console.log('test 17 2' + event.stream);
  videoPlayer2.srcObject = event.stream;
}

// step 2: connection interaction
// create PeerConnection object
let pc = new RTCPeerConnection();
function startRTC(stream) {
  console.log('testing 1');
  
  // send ice candidates to other peer
  pc.onicecandidate = function(event) {
    pc2.getIceCandidate(event.candidate);
  };

  // show stream on current video element
  videoPlayer.srcObject = stream;

  // add stream to PeerConnection
  console.log('testing 2');
  pc.addStream(stream);

  // create offer
  console.log('testing 3');
  pc.createOffer()
    .then(function(offer) {
      console.log('testing 4');
      pc.setLocalDescription(offer)
        .catch(console.log);
      pc2.setDescription(offer);
    })
    .catch(function(error) {
      console.log('error: ' + error);
    });

  pc.setDescription = function(answer) {
    pc.setRemoteDescription(answer)
      .catch(console.log);
  };

}
