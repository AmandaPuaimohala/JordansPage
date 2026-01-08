let globeTimeout;

export const globePlaces = [
  { id: 'japan', title: '🌸', image: 'places/cherry.jpg', caption: '' },
  { id: 'france', title: '', image: 'places/castle.jpg', caption: '' },
  { id: 'bangkok', title: '🛺', image: 'places/bangkok.jpg', caption: '' },
  { id: 'castle', title: '👸🏻👸🏼🏰', image: 'places/scot.jpg', caption: '' },
  { id: 'china', title: '', image: 'places/wall.jpg', caption: '' },
  { id: 'italy', title: '🏟', image: 'places/collum.jpg', caption: '⚔️' },
  { id: 'lisbon', title: '', image: 'places/lisbon.jpg', caption: '' },
  { id: 'cow', title: '🐄', image: 'places/cow.jpg', caption: 'Moooooo!' }
];

export function showGlobePlace(popup) {
  const popupText = document.getElementById('popup-text');
  if (popupText) popupText.textContent = '';


  const existingContainer = document.getElementById('globe-row');
  if (existingContainer) existingContainer.remove();

  const container = document.createElement('div');
  container.id = 'globe-row';
  container.style.cssText = `
    position: relative;
    width: 100%;
    max-width: 1200px;
    height: 500px;
    margin: 60px auto 0 auto;
    overflow: visible;
  `;
  popup.appendChild(container);
  popup.style.display = 'block';

  const closeBtn = document.getElementById('close-popup');
  closeBtn.style.cssText = `
    display: block;
    margin: 10px auto 0 auto;
    padding: 8px 20px;
    font-size: 16px;
    border-radius: 8px;
  `;

  let index = 0;
  let active = true; 

  function showNextImage() {
    if (!active) return; 
    if (index >= globePlaces.length) index = 0;
    const place = globePlaces[index++];
    
    const imgDiv = document.createElement('div');
    imgDiv.style.cssText = `
      position: absolute;
      top: ${Math.random() * 80 + 10}%;
      left: ${Math.random() * 80 + 10}%;
      transform: translate(-50%, -50%);
      opacity: 0;
      transition: opacity 1.5s ease;
      text-align: center;
    `;
    imgDiv.innerHTML = `
      <h4 style="color:white">${place.title}</h4>
      <img src="${place.image}" style="width:250px; border-radius:10px;" />
      <p style="color:white; margin-top:5px">${place.caption}</p>
    `;
    container.appendChild(imgDiv);

    requestAnimationFrame(() => imgDiv.style.opacity = '1');

    setTimeout(() => {
      imgDiv.style.opacity = '0';
      setTimeout(() => imgDiv.remove(), 2000);
    }, 4000);

    globeTimeout = setTimeout(showNextImage, 1000);
  }

  showNextImage();

const plane = document.createElement('div');
plane.textContent = '✈️';
plane.style.cssText = `
  position: fixed;
  top: 15%;
  left: 0px;
  font-size: 96px;
  z-index: 9999;
  pointer-events: none;
  transition: opacity 1s ease; /* fade transition */
  opacity: 1;
`;
popup.appendChild(plane);

plane.animate(
  [
    { transform: 'translateX(0)' },
    { transform: `translateX(${window.innerWidth - 200}px)` }
  ],
  {
    duration: 5000,
    easing: 'linear',
    fill: 'forwards'
  }
);

setTimeout(() => {
  plane.style.opacity = '0';
  setTimeout(() => plane.remove(), 1000);
}, 2000);


  return function stopGlobe() {
    active = false;
    clearTimeout(globeTimeout);
    if (container) container.remove();
    if (plane) plane.remove();
  };
}
