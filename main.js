/**
  * This corresponds to my introduction to WebRTC at http://eis.jonathanlam.tech/posts/better-rtc-with-webrtc
  * @author Jonathan Lam
  */

// video elements and error handling mechanism
let videoPlayer1 = document.querySelector('#video-player-1');
let videoPlayer2 = document.querySelector('#video-player-2');
function handleError(err) {
  console.error(err);
}

/*
  SET UP MEDIA AND RTCPEERCONNECTION OBJECTS
  STEPS 1-5
  note that createOffer (in the handshake) must occur after addStream() (in this section). More details here: https://stackoverflow.com/questions/27489881/webrtc-never-fires-onicecandidate/27758788#27758788
*/
/* step 1: host: obtain a stream of data */
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: false
})
  .then(hostBeginRTC)
  .catch(handleError);

/*
  step 2: host and client: match a host and a client via some signalling channel/protocol
  (here there is no signalling channel, so the other pc's functions will be called for simplicity)
*/

/* step 3: host and client: create RTCPeerConnection objects */
let pc1 = new RTCPeerConnection();
let pc2 = new RTCPeerConnection();

/* step 4: (host): add stream to the WebRTC connectionn */
function hostBeginRTC(stream) {
  pc1.addStream(stream);

  // also show in "input" video element
  videoPlayer1.srcObject = stream;

  // handshake
  handshake();
}

/* step 5: (client): handle stream */
pc2.onaddstream = event => {
  // show in "output" video element
  videoPlayer2.srcObject = event.stream;
}

/*
  HANDLE ICE CANDIDATES
  STEPS 6-7
  note that ice candidates are generated when setLocalDescription() (in the handshake) is called
*/

/* step 6: host: handle ICE candidates and send to client */
pc1.onicecandidate = event => {
  /* step 7: client: handle ice candidates sent by the host */
  if(event.candidate !== null)
    pc2.addIceCandidate(event.candidate)
      .catch(handleError);
}

/*
  ESTABLISH THE HANDSHAKE
  STEPS 8-12
*/
function handshake() {
  /* step 8: host: create offer */
  pc1.createOffer()
    .then(offer => {
      pc1.setLocalDescription(offer)
        .catch(handleError);

      /* step 9: host: send host's SDP description to client via signalling channel */
      pc2.setRemoteDescription(offer)
        .catch(handleError);

      /* step 10: client: receive offer and create answer */
      pc2.createAnswer()
        .then(answer => {
          
          /* step 11: client: send client's SDP offer and create answer */
          pc2.setLocalDescription(answer);

          /* step 12: host: receive answer */
          pc1.setRemoteDescription(answer)
            .catch(handleError);

        });
    });
}
