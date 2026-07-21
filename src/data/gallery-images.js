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
//
// SEO copy pass: marketing supplied 8 SEO alt texts for what is a 9-image
// gallery. 8 were matched to their image by content (see CLAUDE.md for the
// reported mapping); the 9th (coupleRiver, "couple looking at river.png")
// has no corresponding SEO alt and keeps its prior descriptive alt —
// flagged for marketing to confirm/supply one.
export const galleryImages = [
  { src: villaPool, alt: 'Villa exterior with private pool — riverfront plots in Sindhudurg', focal: 'center 58%' },
  { src: sittingPool, alt: 'Poolside seating, The Riviera riverfront villa', focal: 'center 65%' },
  { src: boatDock, alt: 'Private boat dock on the Gad River, The Riviera', focal: 'center 58%' },
  { src: boatSunset, alt: 'Gad River at sunset — riverfront living in Konkan', focal: 'center 58%' },
  { src: coupleRiver, alt: 'Couple looking out at the river', focal: 'center 30%' },
  { src: garden, alt: 'Riverside villa garden walk, Sindhudurg', focal: 'center 60%' },
  { src: livingRoom, alt: 'River-view living room, The Riviera villa plots', focal: 'center' },
  { src: villaLineup, alt: 'Riverfront villas at sunset, Vagade, Sindhudurg', focal: 'center 45%' },
  { src: villaRiverRow, alt: 'Villas along the Gad River riverfront walkway', focal: 'center 55%' },
];
