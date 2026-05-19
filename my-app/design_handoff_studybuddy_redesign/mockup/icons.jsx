/* global React */
// Shared SVG icons. Inline strokeWidth & viewBox tuned for editorial feel.

const Icon = ({ d, size = 16, stroke = 1.5, fill = "none", style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
       stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
       style={style}>
    {d}
  </svg>
);

const I = {
  Library: (p) => <Icon {...p} d={<><path d="M4 4v16M9 4v16M14 4v16l4 -2l-1 -14z"/></>}/>,
  Upload:  (p) => <Icon {...p} d={<><path d="M12 4v12"/><path d="M7 9l5-5l5 5"/><path d="M4 20h16"/></>}/>,
  Search:  (p) => <Icon {...p} d={<><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></>}/>,
  Plus:    (p) => <Icon {...p} d={<><path d="M12 5v14M5 12h14"/></>}/>,
  Arrow:   (p) => <Icon {...p} d={<><path d="M5 12h14M13 5l7 7-7 7"/></>}/>,
  Left:    (p) => <Icon {...p} d={<><path d="M15 18l-6-6 6-6"/></>}/>,
  Right:   (p) => <Icon {...p} d={<><path d="M9 18l6-6-6-6"/></>}/>,
  Up:      (p) => <Icon {...p} d={<><path d="M18 15l-6-6-6 6"/></>}/>,
  Down:    (p) => <Icon {...p} d={<><path d="M6 9l6 6 6-6"/></>}/>,
  Doc:     (p) => <Icon {...p} d={<><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></>}/>,
  Cards:   (p) => <Icon {...p} d={<><rect x="3" y="5" width="14" height="14" rx="1.5"/><path d="M7 9h6M7 12h6M7 15h4"/><path d="M17 8h4v12a1.5 1.5 0 0 1 -1.5 1.5H10"/></>}/>,
  Quiz:    (p) => <Icon {...p} d={<><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 .9-1 1.7"/><circle cx="12" cy="16" r="0.5" fill="currentColor"/></>}/>,
  Overview:(p) => <Icon {...p} d={<><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></>}/>,
  Flame:   (p) => <Icon {...p} d={<><path d="M12 3c1 4-3 5-3 9a4 4 0 0 0 8 0c0-2-1-3-2-4 0 1.5-1 2-1 2s2-3-2-7z"/></>}/>,
  Trash:   (p) => <Icon {...p} d={<><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></>}/>,
  Download:(p) => <Icon {...p} d={<><path d="M12 3v13M7 11l5 5 5-5M4 21h16"/></>}/>,
  Check:   (p) => <Icon {...p} d={<><path d="M5 12l5 5L20 7"/></>}/>,
  X:       (p) => <Icon {...p} d={<><path d="M6 6l12 12M18 6L6 18"/></>}/>,
  Spark:   (p) => <Icon {...p} d={<><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6"/></>}/>,
  Sun:     (p) => <Icon {...p} d={<><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5.6 5.6L4.2 4.2M19.8 19.8l-1.4-1.4M5.6 18.4l-1.4 1.4M19.8 4.2l-1.4 1.4"/></>}/>,
  Moon:    (p) => <Icon {...p} d={<><path d="M20 14a8 8 0 1 1 -10-10 7 7 0 0 0 10 10z"/></>}/>,
  Settings:(p) => <Icon {...p} d={<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 0 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5h0a1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></>}/>,
  Sort:    (p) => <Icon {...p} d={<><path d="M3 6h13M3 12h9M3 18h5"/><path d="M17 12l3 3 3-3M20 5v10"/></>}/>,
  Bookmark:(p) => <Icon {...p} d={<><path d="M6 3h12v18l-6-4-6 4z"/></>}/>,
  Pen:     (p) => <Icon {...p} d={<><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></>}/>,
  Refresh: (p) => <Icon {...p} d={<><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/></>}/>,
  Folder:  (p) => <Icon {...p} d={<><path d="M3 7a2 2 0 0 1 2-2h4l2 3h8a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2H5a2 2 0 0 1 -2 -2z"/></>}/>,
};

window.I = I;
