// initialize Hoodie
var hoodie  = new Hoodie();
var peerconfig = {"iceServers": [
        {url: "stun:stun.l.google.com:19302"},
        {url:"turn:71.6.135.115:3478",username:"test",credential:"tester"},
        {url:"turn:71.6.135.115:3479",username:"test",credential:"tester"}
    ]};
var mediaconfig = {'audio': true,'video': true}; 
var pc = RTCPeerConnection(peerconfig, null);
var attempt = "nothing";

function failed(){
    console.log(attempt+" failed...");
}

function answerCreated(localDesc) {
    var sd = new RTCSessionDescription(localDesc);
    attempt="setLocalDescription";
    pc.setLocalDescription(sd, function() {
        hoodie.store.add("answer", localDesc);
    },failed);
};

function GUM(){
    attempt="getUserMedia";
    getUserMedia (mediaconfig,
        function(stream) {
            pc.addStream(stream);
            attempt="createAnswer";
            pc.createAnswer(answerCreated, 
                failed, {});
            },failed
     );
}
  
pc.onicecandidate = function(evt) {
    if (evt.candidate != null) {
       hoodie.store.add("petcandidate", evt.candidate);
    }
};

pc.onaddstream = function(e){
    var video = document.getElementById('ownervideo');
    attachMediaStream(video,e.stream);
};

hoodie.account.signIn('test', 'test');

hoodie.store.removeAll("ownercandidate").done(
        function() {
            hoodie.remote.on('add:ownercandidate',
                    function(candy) {
                        pc.addIceCandidate(new RTCIceCandidate(candy));
                        hoodie.store.remove(candy.type, candy.id);
                    });
        });
hoodie.store.removeAll("offer").done(
        function() {
            hoodie.remote.on('add:offer',
                    function(newObject) {
                        var sd = new RTCSessionDescription(newObject);
                        attempt = "setRemoteDescription";
                        pc.setRemoteDescription(sd, GUM, failed);
                        hoodie.store.remove(newObject.type, newObject.id);
                    });
        });
$('#ownervideo').attr('poster', "assets/img/" + hoodie.account.username + ".jpg");

