browser.commands.onCommand.addListener(async (command) => {
    try {
        const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
        if (!tab?.id || !tab.url.includes("youtube.com")) return;

        if (command === "trigger-count-in") {
            browser.tabs.sendMessage(tab.id, { action: "START_COUNT_IN", rewind: false });
        } else if (command === "trigger-rewind-count-in") {
            browser.tabs.sendMessage(tab.id, { action: "START_COUNT_IN", rewind: true });
        }
    } catch (err) {
        console.error("Background Error:", err);
    }
});