//Copyright(c)2009 tikirobot.net Software license AGPL version 3.
//inspired by the magical http://inbflat.net

// Array Remove - By John Resig (MIT Licensed)
function arrayremove(array, from, to) {
    var rest = array.slice((to || from) + 1 || array.length);
    array.length = from < 0 ? array.length + from : from;
    return array.push.apply(array, rest);
}

// BbBuddha()
//______________________________________________________________________________
function BbBuddha() {

    this.timer      = null;
    this.numPlaying = 0;
    this.numLoaded  = 0;
    this.maxPlaying = 6;
    this.isPlaying  = false;
    this.paused = [];

    this.playFirst = [0, 1, 2, 3, 4, 5, 6, 7, 9, 10, 11];  // skip 8
}

// init()
//______________________________________________________________________________
BbBuddha.prototype.init = function() {
    //console.log('init BbBuddha');

    for (var i=0; i<12; i++) {
        $('#myytplayer'+i).get(0).addEventListener('onStateChange', 'stateChange');
    }

    $('#controls').removeClass('loading');
    this.start();
}

// start()
//______________________________________________________________________________
BbBuddha.prototype.start = function() {
    var self   = this;

    if (this.paused.length) {
        $.each(this.paused, function (i, data) {
            $('#myytplayer'+data).get(0).playVideo();
        });
        this.paused = [];
    }
    else {
        this.startVideo();
    }

    this.timer = setInterval(function(){ self.startVideo() }, 20000);
    this.isPlaying = true;
    $('#controls').addClass('playing');
}

// toggle()
//______________________________________________________________________________
BbBuddha.prototype.toggle = function() {
    if (this.isPlaying) {
        this.pause();
    } else {
        this.start();
    }
}

// pause()
//______________________________________________________________________________
BbBuddha.prototype.pause = function() {
    clearInterval(this.timer);
    for (var i=0; i<12; i++) {
        var player = $('#myytplayer'+i).get(0);
        if (player.getPlayerState() == 1) {
            player.pauseVideo();
            this.paused.push(i);
        }
    }
    this.isPlaying = false;
    this.numPlaying = 0;
    $('#controls').removeClass('playing');
}

BbBuddha.prototype.stop = function () {
    clearInterval(this.timer);
    $('#controls').removeClass('playing');
}

// pickVideo()
//______________________________________________________________________________
BbBuddha.prototype.pickVideo = function () {
    var vidNum;

    // First, play all the musical phrases at random without replacement.
    if (this.playFirst && this.playFirst.length) {
        var i = Math.floor(Math.random() * this.playFirst.length);
        vidNum = this.playFirst[i];
        arrayremove(this.playFirst, i);
        return vidNum;
    }
    // Then play the spoken word piece.
    else if (this.playFirst) {
        this.playFirst = null;
        return 8;
    }

    // Then just pick one at random (with replacement), skipping the
    // spoken word phrase most of the time.
    vidNum = Math.floor(Math.random() * 12);
    if (8 == vidNum) { // special case for spoken word
        // I love the spoken word piece, but if I leave this
        // playing all day, I hear it too often
        if (Math.random() > 0.25) {
            //console.log('Picked video 8 but skipping it');
            return;
        }
    }

    return vidNum;
}

// startVideo()
//______________________________________________________________________________
BbBuddha.prototype.startVideo = function() {
    if (this.numPlaying >= this.maxPlaying) {
        //console.log('numPlaying = ' + this.numPlaying + ', returning');
        return;
    }
    var vidNum = this.pickVideo();
    //console.log('picked video ' + vidNum);
    if (vidNum == undefined) {
        return;
    }

    var player = $('#myytplayer'+vidNum).get(0);
    var state  = player.getPlayerState();   //state 1 == playing

    if (1 != state) {
        var vol = 10 + Math.floor(Math.random() * 90);
        player.setVolume(vol);
        player.playVideo();
        this.numPlaying++;
        //console.log('startVideo ' + vidNum + ' with vol = ' + vol);
    }
}



var buddha = new BbBuddha();

/////Callbacks:

// onYouTubePlayerReady()
//______________________________________________________________________________
function onYouTubePlayerReady(playerid) {
    buddha.numLoaded++;
    $('#numLoaded').text(buddha.numLoaded);
    //console.log(playerid + ' is ready');

    if (12 == buddha.numLoaded) {
        buddha.init();
    }
}

// stateChange()
//______________________________________________________________________________
// States:
//  -1: unstarted
//   0: ended
//   1: playing
//   2: stopped
//   3: buffering
//   5: video cued
function stateChange(newState) {

    if (0 == newState) { //some video stopped playing, update numPlaying
        var numPlaying = 0;
        var i;
        for (i=0; i<12; i++) {
            var player = $('#myytplayer'+i).get(0);
            var state  = player.getPlayerState();   //state 1 == playing
            if (1 == state) {
                numPlaying++;
            }
        }


        buddha.numPlaying = numPlaying;

        //console.log('numPlaying = ' + numPlaying);
    }
}
