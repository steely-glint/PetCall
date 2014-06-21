// initialize Hoodie
var hoodie = new Hoodie();
var configuration = {"iceServers": [
        {url: "stun:stun.l.google.com:19302"},
        {url:"turn:71.6.135.115:3478",username:"test",credential:"tester"},
        {url:"turn:71.6.135.115:3479",username:"test",credential:"tester"}
    ]};
var pc = null;

function setStatus(msg){
    $("robostatus").attr("src","//robohash.org/"+msg+".png");
    $("robostatus").attr("tooltip","status "+msg);
}

setStatus("browser="+webrtcDetectedBrowser);

function error(where,what){
     console.log("error in "+where+" "+what);
     setStatus("error:"+what+":"+where);
}
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
            error("setRemoteDescription","failed");
    });
});

function call() {
    pc = RTCPeerConnection(configuration, null);
    
    pc.onicecandidate = function(evt) {
        if (evt.candidate != null) {
            console.log("ownercandidate adding  "+ JSON.stringify(evt.candidate));
            hoodie.store.add("ownercandidate", evt.candidate);
        }
    };
    pc.onaddstream = function(e){
        console.log("onaddstream ");
        var video = document.getElementById('petvideo');
        attachMediaStream(video,e.stream);
    };
    
    var offerCreated = function(localDesc) {
        var sd = new RTCSessionDescription(localDesc);
        pc.setLocalDescription(sd, function(){ 
            hoodie.store.add("offer",localDesc);
            } , 
            function (){
                error("setLocalDescription", "failed");
            });
    };
    
    getUserMedia ({'audio': true,'video': true},
        function(stream) {
            var localVideo = document.getElementById('ownervideo');
            localVideo.style.opacity = 1;
            attachMediaStream(localVideo,stream);
            localVideo.muted = "muted";
            pc.addStream(stream);
            pc.createOffer(offerCreated, 
                function(e){
                    error("createOffer", "failed");
                }, 
                {});
            },
        function(error) {
                error("getUserMedia", "failed");;
        }
     );

}