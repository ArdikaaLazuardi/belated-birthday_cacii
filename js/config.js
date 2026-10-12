/* ============================================================
   CUSTOMIZE HERE. Photos & audio go in /assets.
   Anything left empty is simply hidden or shown as a quiet placeholder.
   ============================================================ */
window.CONFIG = {
  nickname: "caccii",              // optional. used in the page title
  birthday: "06 . 09 . 2026",              // e.g. "12 . 08 . 2026"  (hidden if empty)
  madeOn: "06 . 09 . 2026",                // e.g. "12 . 10 . 2026"  (empty = today's date)

  // atmospheric backgrounds (empty = the built-in dark artwork is used).
  // ideas: overcast sky, a bedroom window in the afternoon, an empty street, a shadow on a wall.
  photos: {
    cover: "assets/cover.png",               // e.g. "assets/cover.jpg"
    remains: "assets/cover.png",             // chapter 06
    last: "assets/cover.png"                 // chapter 09
  },

  // song. there is ONE audio instance; it keeps playing between chapters.
  // use a file you have the right to use, or leave src empty and use the official link below.
  song: {
    src: "song/membasuh.mp3",                 // e.g. "assets/membasuh.mp3"  (only if you have permission)
    title: "Membasuh",
    artist: "Hindia",
    externalUrl: "https://open.spotify.com/search/Membasuh%20Hindia", // official listening link (fallback)
    autoplay: true           // tries once; browsers may block it, a fallback button appears
  },

  // chapter 03 gallery. 6–8 slots. empty src = neutral placeholder.
  gallery: [
    { src: "gallery/1.jpg", caption: "a day i didn't know i'd remember this much.",         date: "02 . 03 . 2024" },
    { src: "gallery/2.jpg", caption: "ordinary moments, extraordinary in retrospect.",      date: "12 . 03 . 2024" },
    { src: "gallery/3.jpg", caption: "somewhere between the laughter and the silence.",     date: "10 . 12 . 2024" },
    { src: "gallery/4.jpg", caption: "the little things that mean the most.", date: "01 . 06 . 2025" },
    { src: "gallery/5.jpg", caption: "grateful for days like this.",                    date: "21 . 06 . 2025" },
    { src: "gallery/6.jpg", caption: "saving this precious moment right here.",         date: "01 . 06 . 2025" },
    { src: "gallery/7.jpg", caption: "another favorite memory added.", date: "14 . 02 . 2026" },
    { src: "gallery/8.jpg", caption: "just pure happiness, no words needed.",           date: "28 . 02 . 2024" },
  ]
};
