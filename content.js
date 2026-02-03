class CountInManager {
    constructor() {
        this.audioCtx = null;
        this.overlay = null;
        this.isCounting = false;
        this.settings = { bpm: 120, beats: 4 };

        browser.runtime.onMessage.addListener((request) => {
            if (request.action === "START_COUNT_IN") {
                this.start(request.rewind);
            }
        });
    }

    async loadSettings() {
        const res = await browser.storage.local.get({ bpm: 120, beats: 4 });
        this.settings = res;
    }

    getOverlay() {
        if (!this.overlay) {
            this.overlay = document.createElement('div');
            this.overlay.className = 'yt-count-in-overlay';
            document.body.appendChild(this.overlay);
        }
        return this.overlay;
    }

    initAudio() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
    }

    playClick(time, isFirst) {
        const osc = this.audioCtx.createOscillator();
        const envelope = this.audioCtx.createGain();

        osc.frequency.setValueAtTime(isFirst ? 1000 : 600, time);
        osc.type = 'sine';

        envelope.gain.setValueAtTime(0, time);
        envelope.gain.linearRampToValueAtTime(0.2, time + 0.005);
        envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

        osc.connect(envelope);
        envelope.connect(this.audioCtx.destination);

        osc.start(time);
        osc.stop(time + 0.1);
    }

    async start(shouldRewind = false) {
        if (this.isCounting) return;

        const video = document.querySelector('video');
        const isAd = document.querySelector('.ad-showing, .ad-interrupting');

        if (!video || isAd) return;

        if (shouldRewind) {
            video.currentTime = 0;
        }
        await this.loadSettings();
        this.initAudio();

        this.isCounting = true;
        video.pause();

        const overlay = this.getOverlay();
        const secondsPerBeat = 60 / this.settings.bpm;
        const startTime = this.audioCtx.currentTime + 0.05;

        for (let i = 0; i < this.settings.beats; i++) {
            const beatTime = startTime + (i * secondsPerBeat);
            const beatNumber = i + 1;

            this.playClick(beatTime, i === 0);

            const delayMs = Math.max(0, (beatTime - this.audioCtx.currentTime) * 1000);
            setTimeout(() => {
                overlay.textContent = beatNumber;
                overlay.classList.add('visible');
                setTimeout(() => overlay.classList.remove('visible'), 150);
            }, delayMs);
        }

        const endDelayMs = (startTime + (this.settings.beats * secondsPerBeat) - this.audioCtx.currentTime) * 1000;
        setTimeout(() => {
            video.play();
            this.isCounting = false;
        }, endDelayMs);
    }
}

new CountInManager();