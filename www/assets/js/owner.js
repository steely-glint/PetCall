// initialize Hoodie
var hoodie = new Hoodie();
var configuration = null;
var pc = null;
var gum = navigator.msGetUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia || navigator.getUserMedia;

hoodie.remote.on('add:petcandidate', function (candy) {
    console.log("got candidate "+JSON.stringify(candy));
    pc.addIceCandidate(new RTCIceCandidate(candy));
});

hoodie.remote.on('add:answer', function (newObject) {
    console.log("got answer "+JSON.stringify(newObject));
    var sd = new RTCSessionDescription(newObject);
    pc.setRemoteDescription(sd, 
      function() {
            console.log("set remote answer ");
    },function() {
            console.log("failed to set remote answer");
    });
});

function call() {
    if (typeof webkitRTCPeerConnection == "function") {
        pc = new webkitRTCPeerConnection(configuration, null);
    } else if (typeof mozRTCPeerConnection == "function") {
        pc = mozRTCPeerConnection(configuration, null);
    }
    pc.onicecandidate = function(evt) {
        if (evt.candidate != null) {
            console.log("ownercandidate adding  "+ JSON.stringify(evt.candidate));
            hoodie.store.add("ownercandidate", evt.candidate);
        }
    };

    var offerCreated = function(localDesc) {
        var sd = new RTCSessionDescription(localDesc);
        pc.setLocalDescription(sd, function(){ 
            hoodie.store.add("offer",localDesc);
            } , 
            function (){
                console.log("setlocal failed");
            });
    };
    var offerFail = function(e) {
        console.log('failed to create offer ' + JSON.stringify(e));
    };
    navigator.webkitGetUserMedia ({'audio': true,'video': true},
        function(stream) {
            var localVideo = document.getElementById('myVideo');
            localVideo.style.opacity = 1;
            localVideo.src = webkitURL.createObjectURL(stream);
            localVideo.muted = "muted";
            pc.addStream(stream);
            pc.createOffer(offerCreated, offerFail, {});
            },
        function(error) {
                console.log("Failed to get access to local media. Error code was " + error.code);
        }
     );

}