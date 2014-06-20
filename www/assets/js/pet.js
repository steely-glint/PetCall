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

hoodie.remote.on('add:offer', function (newObject) {
    console.log("got offer "+JSON.stringify(newObject));
    var sd = new RTCSessionDescription(newObject);
    pc.setRemoteDescription(sd, 
      function() {
            console.log("set remote offer ");
            pc.createAnswer(answerCreated, 
            function(){
               console.log("set remote failed ");
            }, {});
    },function() {
            console.log("failed to set remote offer");
    });
});

if (typeof webkitRTCPeerConnection == "function") {
    pc = new webkitRTCPeerConnection(configuration, null);
} else if (typeof mozRTCPeerConnection == "function") {
    pc = mozRTCPeerConnection(configuration, null);
}
pc.onicecandidate = function(evt) {
    if (evt.candidate != null) {
       console.log("petcandidate adding");

        hoodie.store.add("petcandidate", evt.candidate);
    }
};