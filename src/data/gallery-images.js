import villaPool from '../assets/images/villa view with swimming pool.png';
import sittingPool from '../assets/images/sitting along the swimming pool.png';
import boatDock from '../assets/images/boat along with dock.png';
import boatSunset from '../assets/images/boat in river sunset.png';
import coupleRiver from '../assets/images/couple looking at river.png';
import garden from '../assets/images/walking along the garden.png';
import livingRoom from '../assets/images/river view from living room.png';
import villaLineup from '../assets/images/sunset view of villa lined up.png';
import villaRiverRow from '../assets/images/villa lined up against the river.png';

// Single source of truth for the lifestyle gallery — LifestyleGallery.astro
// (grid tiles) and Lightbox.astro (full-size slides) both import this array,
// so tile order and lightbox slide order can never drift apart.
export const galleryImages = [
  { src: villaPool, alt: 'Villa exterior with private swimming pool', focal: 'center 58%' },
  { src: sittingPool, alt: 'Seating area along the swimming pool', focal: 'center 65%' },
  { src: boatDock, alt: 'Private boat access at the dock', focal: 'center 58%' },
  { src: boatSunset, alt: 'Boat on the river at sunset', focal: 'center 58%' },
  { src: coupleRiver, alt: 'Couple looking out at the river', focal: 'center 30%' },
  { src: garden, alt: 'Walking along the landscaped garden', focal: 'center 60%' },
  { src: livingRoom, alt: 'River view from a villa living room', focal: 'center' },
  { src: villaLineup, alt: 'Villas lined up along the river at sunset', focal: 'center 45%' },
  { src: villaRiverRow, alt: 'Villas lined up along the riverfront walkway', focal: 'center 55%' },
];
