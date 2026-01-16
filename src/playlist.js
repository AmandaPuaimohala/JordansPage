// playlist.js
export function startPlaylistEvent(popup, playlistID) {
  const popupText = document.getElementById('popup-text');

  // Embed YouTube playlist with full recommended attributes
  popupText.innerHTML = `
    <p>our playlist! 🎶</p>
    <iframe 
      width="100%" 
      height="315" 
      src="https://www.youtube.com/embed/videoseries?si=SIAuXkRUXDfodowG&amp;list=PLeRzOrAgDarvWWFillWtLVXFykNtVQAn_" 
      title="YouTube video player" 
      frameborder="0" 
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
      referrerpolicy="strict-origin-when-cross-origin"
      allowfullscreen
      style="border-radius: 12px; margin-top: 10px;"
    ></iframe>
    <button id="closePlaylistBtn" style="
      margin-top: 15px;
      padding: 10px 20px;
      font-size: 1rem;
      border-radius: 8px;
      border: none;
      background: #ff5555;
      color: #fff;
      cursor: pointer;
      transition: all 0.2s ease;
    ">Close Playlist</button>
  `;

  popup.style.display = 'block';

  const closeBtn = document.getElementById('closePlaylistBtn');
  closeBtn.addEventListener('mouseenter', () => closeBtn.style.background = '#ff7777');
  closeBtn.addEventListener('mouseleave', () => closeBtn.style.background = '#ff5555');

  closeBtn.addEventListener('click', () => {
    popup.style.display = 'none';
  });
}
