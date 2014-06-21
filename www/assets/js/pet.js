// initialize Hoodie
var hoodie  = new Hoodie();
var configuration = null;
var pc;

hoodie.remote.on('add:ownercandidate', function (candy) {
    console.log("got candidate "+JSON.stringify(candy));
    pc.addIceCandidate(new RTCIceCandidate(candy));
});


var answerCreated = function(localDesc) {
    var sd = new RTCSessionDescription(localDesc);
    pc.setLocalDescription(sd, function() {
        hoodie.store.add("answer", localDesc);
    },
            function() {
                console.log("setlocal failed");
            });
};

function gum(){
        getUserMedia ({'audio': true,'video': true},
        function(stream) {
            // pets don't like mirrors
            pc.addStream(stream);
            pc.createAnswer(answerCreated, 
                function(){
                    console.log("create answer failed ");
                }, {});
            },
        function() {
                    console.log("gum failed ");
        }
     );
}

hoodie.remote.on('add:offer', function (newObject) {
    console.log("got offer "+JSON.stringify(newObject));
    var sd = new RTCSessionDescription(newObject);
    pc.setRemoteDescription(sd, 
      function() {
            console.log("set remote offer ");
            gum();

    },function() {
            console.log("failed to set remote offer");
    });
});

pc = RTCPeerConnection(configuration, null);

pc.onicecandidate = function(evt) {
    if (evt.candidate != null) {
       console.log("petcandidate adding");
       hoodie.store.add("petcandidate", evt.candidate);
    }
};

pc.onaddstream = function(e){
    var video = document.getElementById('ownervideo');
    attachMediaStream(video,e.stream);
};