// initialize Hoodie
var hoodie = new Hoodie();
var configuration = {"iceServers": [
        {url: "stun:stun.l.google.com:19302"},
        {url:"turn:71.6.135.115:3478",username:"test",credential:"tester"},
        {url:"turn:71.6.135.115:3479",username:"test",credential:"tester"}
    ]};
var mediaConstraints  = {
  video: {
    mandatory: {
      maxWidth: 640,
      maxHeight: 360
    }
  }, 
  audio: true
};
var pc = null;

function setStatus(msg){
    $("#ownervideo").attr("poster","//robohash.org/"+msg+".png");
    $("#ownervideo").attr("tooltip","status "+msg);
}


function error(where,what){
     console.log("error in "+where+" "+what);
     setStatus("error:"+what+":"+where);
}

hoodie.account.signIn('test', 'test');
setStatus(hoodie.account.username);

hoodie.store.removeAll("petcandidate").done(
        function() {
            hoodie.remote.on('add:petcandidate', function(candy) {
                console.log("got candidate " + JSON.stringify(candy));
                pc.addIceCandidate(new RTCIceCandidate(candy));
            });
        });
hoodie.store.removeAll("answer").done(
        function() {
            hoodie.remote.on('add:answer', function(newObject) {
                console.log("got answer " + JSON.stringify(newObject));
                var sd = new RTCSessionDescription(newObject);
                pc.setRemoteDescription(sd,
                        function() {
                            console.log("set remote answer ");
                        },
                        function() {
                            error("setRemoteDescription", "failed");
                        });
            });
        });
$('#petvideo').attr('poster', "assets/img/" + hoodie.account.username + ".jpg");

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
    
    getUserMedia (mediaConstraints,
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
        function(e) {
                error("getUserMedia", "failed");;
        }
     );

}