document.addEventListener('DOMContentLoaded', () => {
    const songListUrl = '/tctc_radio/songs.txt';
    const speakListUrl = '/tctc_radio/speak.txt';
    let musicFiles = [];
    let speakFiles = [];
    let isPlaying = false;
    let announcementInterval;

    // Initialize audio players and control buttons
    const songPlayer = new Audio();
    const announcementPlayer = new Audio();
    const playPauseButton = document.getElementById('playPauseButton');
    const nextButton = document.getElementById('nextButton');

    console.log("DOM fully loaded and parsed.");

    if (!playPauseButton || !nextButton) {
        console.error("Play or Next button not found.");
        return;
    }

    // Disable buttons until songs are loaded
    playPauseButton.disabled = true;
    nextButton.disabled = true;

    async function fetchList(url, type) {
        try {
            const response = await fetch(url);
            const text = await response.text();

            const files = text.trim().split('\n').map(file => file.trim());
            if (type === 'music') {
                musicFiles = files;
                console.log("Fetched music files:", musicFiles);
                if (musicFiles.length > 0) {
                    playPauseButton.disabled = false;
                    nextButton.disabled = false;
                } else {
                    console.error("No songs found in the list.");
                }
            } else if (type === 'speak') {
                speakFiles = files;
                console.log("Fetched speak files:", speakFiles);
            }
        } catch (error) {
            console.error(`Failed to load the ${type} list:`, error);
        }
    }

    fetchList(songListUrl, 'music');
    fetchList(speakListUrl, 'speak');

    function playRandomSong() {
        if (musicFiles.length === 0) return;

        const randomIndex = Math.floor(Math.random() * musicFiles.length);
        const selectedSong = musicFiles[randomIndex].startsWith('/tctc_radio/music/')
            ? musicFiles[randomIndex]
            : `/tctc_radio/music/${musicFiles[randomIndex]}`;

        songPlayer.src = selectedSong;
        console.log("Playing song:", selectedSong);

        songPlayer.play().catch(error => console.error("Error playing song:", error));
        isPlaying = true;
        updatePlayPauseButton();
    }

    function togglePlayPause() {
        if (!isPlaying) {
            if (!songPlayer.src) {
                playRandomSong();
                startAnnouncementTimer();
            } else {
                songPlayer.play();
            }
            isPlaying = true;
        } else {
            songPlayer.pause();
            isPlaying = false;
            clearInterval(announcementInterval);
        }
        updatePlayPauseButton();
    }

    function updatePlayPauseButton() {
        playPauseButton.textContent = isPlaying ? 'Pause' : 'Play';
    }

    function playNextSong() {
        playRandomSong();
    }

    playPauseButton.addEventListener('click', togglePlayPause);
    nextButton.addEventListener('click', playNextSong);

    function startAnnouncementTimer() {
        clearInterval(announcementInterval);
        announcementInterval = setInterval(() => {
            if (speakFiles.length > 0) {
                playAnnouncement();
            }
        }, 10 * 60 * 1000); // Every 10 minutes
    }

    function playAnnouncement() {
        const randomIndex = Math.floor(Math.random() * speakFiles.length);
        const selectedAnnouncement = speakFiles[randomIndex].startsWith('/tctc_radio/speak/')
            ? speakFiles[randomIndex]
            : `/tctc_radio/speak/${speakFiles[randomIndex]}`;

        announcementPlayer.src = selectedAnnouncement;
        announcementPlayer.volume = 0.5; // Set announcement volume lower than the song
        console.log("Playing announcement:", selectedAnnouncement);

        announcementPlayer.play().catch(error => console.error("Error playing announcement:", error));
    }

    songPlayer.addEventListener('ended', playRandomSong);
    fetchList(songListUrl, 'music');
    fetchList(speakListUrl, 'speak');
});
