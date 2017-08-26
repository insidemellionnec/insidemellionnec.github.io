function clockToSecs(time) {
    if (typeof time == "string") {
        if (time.indexOf(':') >= 0) {
            timeSplit = time.split(':');
            time = parseInt(timeSplit[0]) * 60 + parseInt(timeSplit[1]);
        }
    }
    return time;
}

function Chapter(start, title, thumbnail) {
    this.start = clockToSecs(start);
    this.title = title || 'Chapter title';
}

var playerModel = {
    chapters: [
        new Chapter("00:05", 'Introduction'),
        new Chapter("01:40", 'Pourquoi Mellionnec?'),
        new Chapter("04:11", "Phase d'écriture"),
        new Chapter("06:35", 'Construction du récit'),
        new Chapter("08:57", 'Le réel'),
        new Chapter("13:59", 'Tout montrer?'),
        new Chapter("16:17", 'Esthétique'),
        new Chapter("19:04", 'La place du réalisateur'),
        new Chapter("21:38", 'Les sujets'),
        new Chapter("23:57", 'Le but du documentaire')
    ]
};

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var player;

function onYouTubeIframeAPIReady() {
    initPlayer();
}

function initPlayer() {
    if (window.YT && window.YT.loaded && $('#player').length) {
        player = new Player('dwIDuRBHLnI', playerModel);
    }
}

function Player(videoId, model) {
    this.element = $('#player');
    this.element.attr('ready', false);
    this.model = model;
    this.ytp = new YT.Player('ytp', {
        height: '390',
        width: '640',
        videoId: videoId,
        events: {
            'onReady': this.onPlayerReady.bind(this),
            'onStateChange': this.onStateChange.bind(this)
        },
        playerVars: {
            controls: 0,
            disablekb: 1,
            iv_load_policy: 3,
            modestbranding: 1,
            showinfo: 0,
            autoplay: 0,
            rel: 0,
            suggestedQuality: 'highres'
        }
    });

    this.element.on('click', '.play', this.play.bind(this));
    this.element.on('click', '.pause', this.pause.bind(this));
    this.element.on('click', '.progress', this.onProgressClick.bind(this));
    this.element.on('click', '.chapter', this.gotoChapter.bind(this));

    // visual UI
    this.elapsedBar = this.element.find('.elapsed');
}

Player.prototype.renderChapters = function(model) {
    w3.displayObject("chapters", model);
}

var autoplayOnReady = false;
Player.prototype.onPlayerReady = function() {
    this.renderInterval = setInterval(this.render.bind(this), 1000);
    this.updateModelWithVideoData(this.model);
    this.renderChapters(this.model);
    this.element.on('mousemove mouseover mouseleave', '.progress', this.onProgressMouseEvent.bind(this));
    if (autoplayOnReady) {
        this.play();
    } else {
        this.goto(0);
        this.pause();
    }
}

Player.prototype.updateModelWithVideoData = function(model) {
    var duration = this.getDuration();
    for (var i = 0; i < this.model.chapters.length; i++) {
        var chapter = this.model.chapters[i];
        chapter.startPerc = chapter.start / duration * 100;
    }
}

Player.prototype.gotoChapter = function(ev) {
    var chapterView = ev.currentTarget;
    var start = chapterView.getAttribute('start');
    this.goto(start);
}

Player.prototype.renderTime = function(t, position) {
    if (!t) {
        $('#time').hide();
    } else {
        var minutes = Math.floor(t / 60);
        var seconds = Math.floor(t % 60);
        w3.displayObject("time", {
            time: minutes + ":" + (seconds < 10 ? "0" : "") + seconds,
            position: position
        });
        $('#time').show();
    }
}

Player.prototype.renderOverLine = function(perc) {
    $('.line.over').width(perc + "%");
}

Player.prototype.getTimeData = function(ev) {
    var w = ev.currentTarget.clientWidth;
    var x = ev.offsetX;
    var proportion = x / w;
    return {
        t: this.percToTrackSecs(proportion),
        perc: proportion * 100
    }
}

Player.prototype.onProgressMouseEvent = function(ev) {
    if (ev.type == "mouseleave") {
        this.renderTime(0);
        this.renderOverLine(0);
    } else if (this.canSeek()) {
        var td = this.getTimeData(ev);

        this.renderTime(td.t, td.perc);
        this.renderOverLine(td.perc);
    }
}

Player.prototype.play = function(ev) {
    if (this.ytp.playVideo) {
        this.ytp.playVideo();
    } else {
        autoplayOnReady = true;
    }
}

Player.prototype.stop = function(ev) {
    this.ytp.stopVideo();
}

Player.prototype.destroy = function(ev) {
    this.ytp.destroy();
    clearInterval(this.renderInterval);
}

Player.prototype.pause = function(ev) {
    if (this.ytp.pauseVideo) {
        this.ytp.pauseVideo();
    }
}

Player.prototype.goto = function(secs) {
    if (this.canSeek()) {
        this.ytp.seekTo(secs);
    }
}

Player.prototype.onProgressClick = function(ev) {
    if (this.canSeek()) {
        var td = this.getTimeData(ev);
        this.goto(td.t);
    }
}

Player.prototype.percToTrackSecs = function(perc) {
    return this.getDuration() * perc;
}

Player.prototype.getElapsed = function() {
    return this.ytp.getMediaReferenceTime();
}

Player.prototype.getElapsedPerc = function() {
    return this.getElapsed() / this.getDuration() * 100;
}

Player.prototype.getDuration = function() {
    return this.ytp.getDuration();
}

Player.prototype.canPlay = function() {
    return window.YT && window.YT.loaded;
}

Player.prototype.canSeek = function() {
    return this.getDuration() > 0;
}

Player.prototype.isPlaying = function() {
    return this.ytp.getPlayerState && this.ytp.getPlayerState() == 1;
}

Player.prototype.isPaused = function() {
    return this.ytp.getPlayerState && this.ytp.getPlayerState() == 2;
}

Player.prototype.isBuffering = function() {
    return this.ytp.getPlayerState && this.ytp.getPlayerState() == 3;
}

Player.prototype.isEnded = function() {
    return this.ytp.getPlayerState && this.ytp.getPlayerState() == 0;
}

Player.prototype.isUnstarted = function() {
    return this.ytp.getPlayerState && this.ytp.getPlayerState() == -1;
}

Player.prototype.onStateChange = function() {
    if (this.isUnstarted()) {
        this.element.attr('ready', true);
    }

    if (this.isEnded()) {
        this.goto(0);
        this.pause();
    }

    this.render();
}

Player.prototype.render = function() {
    this.element.attr('playing', this.isPlaying());
    this.element.attr('paused', this.isPaused());
    this.element.attr('ended', this.isEnded());
    this.element.attr('buffering', this.isBuffering());
    this.element.attr('unstarted', this.isUnstarted());

    this.updateProgressBar();
}

Player.prototype.updateProgressBar = function() {
    this.elapsedBar.css({
        'width': this.getElapsedPerc() + "%"
    });
}
