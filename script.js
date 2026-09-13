const invitation = document.querySelector('#invitation');
const openState = document.querySelector('#openState');
const openScene = document.querySelector('#openScene');
const detailsState = document.querySelector('#detailsState');
const openButtons = [document.querySelector('#openTrigger'), document.querySelector('#tapOpen')];
const detailsTrigger = document.querySelector('#detailsTrigger');
const backTop = document.querySelector('#backTop');
const imageSources = [...document.images].map(image => image.src);
let transitionLocked = false;
let timers = [];

document.addEventListener('keydown', event => {
  if (event.key === 'Tab') document.body.classList.add('keyboard-nav');
});
document.addEventListener('pointerdown', () => document.body.classList.remove('keyboard-nav'));

const preloadCriticalAssets = () => Promise.all(imageSources.map(src => new Promise(resolve => {
  const image = new Image();
  image.onload = image.onerror = resolve;
  image.src = src;
})));

const later = (callback, delay) => {
  const timer = window.setTimeout(callback, delay);
  timers.push(timer);
  return timer;
};

const clearSequence = () => {
  timers.forEach(window.clearTimeout);
  timers = [];
};

const openInvitation = async () => {
  if (transitionLocked || invitation.dataset.state !== 'closed') return;
  transitionLocked = true;
  await preloadCriticalAssets();
  openScene.classList.remove('is-content-revealed');
  invitation.dataset.state = 'opening';
  openState.setAttribute('aria-hidden', 'false');
  later(() => {
    invitation.dataset.state = 'revealed';
    openScene.classList.add('is-content-revealed');
  }, 1450);
  later(() => { transitionLocked = false; }, 2500);
};

const showDetails = () => {
  if (transitionLocked || invitation.dataset.state !== 'revealed') return;
  transitionLocked = true;
  invitation.dataset.state = 'details';
  openState.setAttribute('aria-hidden', 'true');
  detailsState.setAttribute('aria-hidden', 'false');
  later(() => { transitionLocked = false; }, 850);
};

const resetInvitation = () => {
  if (transitionLocked) return;
  transitionLocked = true;
  clearSequence();
  openScene.classList.remove('is-content-revealed');
  invitation.dataset.state = 'closed';
  detailsState.setAttribute('aria-hidden', 'true');
  openState.setAttribute('aria-hidden', 'true');
  later(() => { transitionLocked = false; }, 850);
};

openButtons.forEach(button => button.addEventListener('click', openInvitation));
detailsTrigger.addEventListener('click', showDetails);
backTop.addEventListener('click', resetInvitation);

const vinylControl = document.querySelector('#vinylControl');
const vinylArtwork = document.querySelector('#vinylArtwork');
const weddingAudio = document.querySelector('#weddingAudio');
let vinylInteracted = false;

const setVinylState = state => {
  vinylArtwork.classList.remove('is-idle', 'is-playing', 'is-paused');
  vinylControl.classList.remove('is-playing');
  if (state === 'playing') vinylArtwork.classList.add('is-playing');
  if (state === 'paused') vinylArtwork.classList.add('is-playing', 'is-paused');
  if (state === 'idle') vinylArtwork.classList.add('is-idle');
  if (state === 'playing') vinylControl.classList.add('is-playing');
  vinylControl.setAttribute('aria-label', state === 'playing' ? 'Pause music' : 'Play music');
};

const toggleMusic = async () => {
  vinylInteracted = true;
  if (!weddingAudio.paused) {
    weddingAudio.pause();
    return;
  }
  if (weddingAudio.ended) weddingAudio.currentTime = 0;
  try {
    await weddingAudio.play();
  } catch (error) {
    setVinylState('paused');
    console.error('Wedding music could not be played.', error);
  }
};

vinylControl.addEventListener('click', toggleMusic);
weddingAudio.addEventListener('play', () => setVinylState('playing'));
weddingAudio.addEventListener('pause', () => {
  if (!weddingAudio.ended) setVinylState(vinylInteracted ? 'paused' : 'idle');
});
weddingAudio.addEventListener('ended', () => {
  weddingAudio.currentTime = 0;
  vinylInteracted = false;
  setVinylState('idle');
});
weddingAudio.addEventListener('error', () => {
  setVinylState(vinylInteracted ? 'paused' : 'idle');
  console.error('Wedding music failed to load from assets/audio/wedding-song.mp3.');
});

const eventTime = Date.parse('2026-12-01T19:00:00+05:00');
const units = {
  days: document.querySelector('#days'), hours: document.querySelector('#hours'),
  minutes: document.querySelector('#minutes')
};

const updateCountdown = () => {
  const remaining = Math.max(0, eventTime - Date.now());
  if (remaining === 0) {
    document.querySelector('#countdown').innerHTML = '<div class="count-values">Today is the day</div>';
    return;
  }
  const totalSeconds = Math.floor(remaining / 1000);
  units.days.textContent = String(Math.floor(totalSeconds / 86400)).padStart(2, '0');
  units.hours.textContent = String(Math.floor(totalSeconds % 86400 / 3600)).padStart(2, '0');
  units.minutes.textContent = String(Math.floor(totalSeconds % 3600 / 60)).padStart(2, '0');
};

updateCountdown();
window.setInterval(updateCountdown, 1000);
