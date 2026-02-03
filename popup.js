const bpmInput = document.getElementById('bpm');
const beatsInput = document.getElementById('beats');
const saveBtn = document.getElementById('save');

browser.storage.local.get({ bpm: 120, beats: 4 }).then((res) => {
    bpmInput.value = res.bpm;
    beatsInput.value = res.beats;
});

saveBtn.onclick = async () => {
    const bpm = Math.min(300, Math.max(20, parseInt(bpmInput.value) || 120));
    const beats = Math.min(16, Math.max(2, parseInt(beatsInput.value) || 4));

    await browser.storage.local.set({ bpm, beats });
    saveBtn.textContent = "Saved!";
    saveBtn.style.background = "#28a745";
    setTimeout(() => window.close(), 600);
};