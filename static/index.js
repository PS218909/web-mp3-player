// Declaring Variables
var play_pause = document.getElementById("play_pause");
var audio = document.getElementById("audio");
var range = document.getElementById("range");
var mute = document.getElementById("mute");
var pn = document.getElementById("play_next");
var arr = localStorage.getItem("queue")!=null?JSON.parse(localStorage.getItem("queue")):new Array();
var playlist_info = document.getElementById("playlist_info");

playlist_info.addEventListener("click", function(e) {
    if (document.getElementsByClassName("f_hidden").length >= 1) {
        return false;
    }
    if (this.children[0].textContent == "expand_less") {
        this.children[0].textContent = "expand_more";
        document.getElementById("queue").classList.remove("hidden");
        document.getElementsByClassName("song_list")[0].classList.add("hidden")
        document.getElementsByClassName("song_list")[0].classList.remove("song_list")
    } else {
        this.children[0].textContent = "expand_less";
        document.getElementsByClassName("hidden")[0].classList.add("song_list");
        document.getElementsByClassName("hidden")[0].classList.remove("hidden");
        document.getElementById("queue").classList.add("hidden");
    }
})

// Queue
function queue_update() {
    var tarr = localStorage.getItem("queue")!=null?JSON.parse(localStorage.getItem("queue")):new Array();
    var queue = document.getElementsByClassName("queue_table")[0];
    queue.innerHTML = "";
    if (tarr.length==0) {
        return;
    }
    for (var i = 0;i<tarr.length;i++) {
        var tr = document.createElement("tr");
        if (tarr[i].split("/songs/")[1] == decodeURI(audio.src.split("/songs/")[1])) {
            tr.classList.add("playing");
        } else {
            tr.classList.add("music");
        }
        tr.appendChild(document.createElement("td"));
        tr.appendChild(document.createElement("td"));
        tr.children[0].innerHTML = "<i class='material-icons'>music_note</i>"
        tr.children[1].textContent = tarr[i].split("/songs/")[1];
        queue.appendChild(tr);
    }
}

// Play Function
function play(song) {
    audio.src = song;
    audio.load();
    playing_class();
}

// Change Playing Mode Function
function play_pause_function () {
    if(audio.paused == true) {
        play_pause.firstChild.textContent = "play_arrow";
        audio.play();
        up = setInterval(update, 1000);
        localStorage.setItem("is_playing", "1")
    } else {
        play_pause.firstChild.textContent = "pause";
        audio.pause();
        localStorage.setItem("is_playing", "0")
    }
    playing_class();
}

// Add Music To Queue
function add_to_queue(song) {
    arr.push(song);
    localStorage.setItem("queue", JSON.stringify(arr));
    queue_update();
}

// Playing Color
function playing_class() {
    var a = document.getElementsByTagName("a");
    var p = document.getElementsByClassName("playing");
    if (p.length>0){
        for (var i = 0;i<p.length;i++) {
            p = p[i];
            p.classList.add("music");
            p.classList.remove("playing");
            p = document.getElementsByClassName("playing");
        }
    }
    for (var i = 2;i<a.length;i++) {
        if (a[i].href == audio.src) {
            var playing = a[i].parentElement;
            playing = playing.parentElement;
            playing.classList.add("playing");
            playing.classList.remove("music");
        }
    }
}

// Play Next Song
function play_next() {
    if (arr.length != 0) {
        audio.src = arr.pop();
        if (arr.length != 0)
            localStorage.setItem("queue", JSON.stringify(arr));
        else
        localStorage.removeItem("queue");
    } else {
        try {
            audio.src = document.getElementsByClassName("playing")[0].nextElementSibling.children[0].children[1].href;
        } catch (e) {
            audio.src = document.getElementsByClassName("music")[0].children[0].children[1].href;
        }
    }
    queue_update();
    playing_class();
}

// Onload Default Changes
window.addEventListener("load", function () {
    range.max = audio.duration;
    tt = Math.floor(audio.duration.toFixed()/60)+":"+Math.round(audio.duration%60);
    if (audio.muted == true) {
        mute.firstChild.textContent = "volume_off";
    } else {
        mute.firstChild.textContent = "volume_up";
    }
    if (audio.src == "http://127.0.0.1:5000/songs/") {
        audio.src = localStorage.getItem("playing");
        range.max = audio.duration;
        audio.currentTime = localStorage.getItem("cntTime");
        range.value = audio.currentTime;
        if (localStorage.getItem("is_mute") == "true") {
            audio.muted = true;
        } else {
            audio.muted = false;
        }
        if (localStorage.getItem("is_playing") == "1") {
            audio.play();
        } else {
            audio.pause();
        }
        var l = localStorage.getItem("playing").split("/");
        document.getElementsByTagName("b")[0].textContent = decodeURI(l[l.length-1]);
        queue_update();
        playing_class();
    }
})

window.addEventListener("beforeunload", function(e) {
    audio.pause();
    localStorage.setItem("is_playing", "0");
})

// Keyboard Controls
window.addEventListener('keydown', function(e) {
    if (document.getElementsByTagName("input")[0] == document.activeElement) {
        return;
    }
    if (e.key == ' ') {
        play_pause_function();
    } else if (e.key == 'r' || e.key == 'R') {
        audio.currentTime = '0';
    } else if (e.key == "ArrowRight") {
        audio.currentTime+=10;
    } else if (e.key == "ArrowLeft") {
        if (audio.currentTime>=10)
            audio.currentTime-=10;
        else 
            audio.currentTime = 0;
    } else if (e.key == "d" || e.key == "D") {
        play_next();
    } else if (e.key == 'm' || e.key == "M") {
        mute.click();
    }
})


// Update Song Duration Progress Bar
range.addEventListener('change', function() {
    audio.currentTime = range.value;
})

// Click Event for Pause And Play
play_pause.addEventListener("click", play_pause_function);

// Click Event for Mute and Unmute
mute.addEventListener("click", function (e) {
    if (audio.muted == true) {
        audio.muted = false;
        mute.firstChild.textContent = "volume_up";
    } else {
        audio.muted = true;
        mute.firstChild.textContent = "volume_off";
    }
});

pn.addEventListener("click", function(e) {
    play_next();
});

// Convert Number to Time Dutation
function numToTime(n) {
    return Math.floor(n/60)+":"+Math.floor(n%60);
}

// Update Interval Function
function update() {
    range.max = audio.duration;
    range.value = audio.currentTime;
    localStorage.setItem("playing", audio.src);
    localStorage.setItem("cntTime", audio.currentTime.toString());
    localStorage.setItem("is_mute", audio.muted);
    document.getElementById("pi").textContent = numToTime(audio.currentTime)+"/"+numToTime(audio.duration);
    if (audio.paused == true) {
        play_pause.firstChild.textContent = "play_arrow";
    } else {
        play_pause.firstChild.textContent = "pause";
    }
    if (audio.currentTime+1>=audio.duration) {
        play_next();
    }
    if (audio.muted == true) {
        mute.firstChild.textContent = "volume_off";
    } else {
        mute.firstChild.textContent = "volume_up";
    }
    var l = localStorage.getItem("playing").split("/");
    document.getElementsByTagName("b")[0].textContent = decodeURI(l[l.length-1]);
}

var up = setInterval(update, 1000);