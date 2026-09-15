// Brand and provider artwork used by the modal chrome.
//
// The ChettaPay mark is inlined rather than fetched: the modals must render the
// same on a locked-down CSP, offline, and on first paint, none of which a remote
// image guarantees. Source of truth for the artwork is `assets/chetta-mark.svg`
// at the repository root - regenerate this literal from it, never hand-edit.
//
// Web build: an SVG data URI, so the mark stays crisp at every density.
export const LOGO_CHETTAPAY =
  'data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2048%2048%22%20width=%2248%22%20height=%2248%22%3E%3Cdefs%3E%3ClinearGradient%20id=%22chettaCoat%22%20x1=%220%22%20y1=%220%22%20x2=%221%22%20y2=%221%22%3E%3Cstop%20offset=%220%22%20stop-color=%22%23E8A33D%22/%3E%3Cstop%20offset=%221%22%20stop-color=%22%23A2590D%22/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect%20width=%2248%22%20height=%2248%22%20rx=%2211%22%20fill=%22url%28%23chettaCoat%29%22/%3E%3Cg%20fill=%22%23FFFFFF%22%3E%3Cpath%20d=%22M20.2%2013.6C17.8%2010.4%2014.8%208.8%2012.8%209.8c-2.2%201.1-2.8%204.4-1.6%208.8Z%22/%3E%3Cpath%20d=%22M27.8%2013.6C30.2%2010.4%2033.2%208.8%2035.2%209.8c2.2%201.1%202.8%204.4%201.6%208.8Z%22/%3E%3Cpath%20d=%22M24%2012.6c5.9%200%2010.9%201.7%2013%205.1%202%203.2%201.5%208.6-.3%2013.1-2%205-6.5%209.4-12.7%209.4s-10.7-4.4-12.7-9.4c-1.8-4.5-2.3-9.9-.3-13.1%202.1-3.4%207.1-5.1%2013-5.1Z%22/%3E%3C/g%3E%3Cg%20fill=%22%23A2590D%22%3E%3Ccircle%20cx=%2217.3%22%20cy=%2216.8%22%20r=%221.25%22/%3E%3Ccircle%20cx=%2224%22%20cy=%2215.2%22%20r=%221.25%22/%3E%3Ccircle%20cx=%2230.7%22%20cy=%2216.8%22%20r=%221.25%22/%3E%3Ccircle%20cx=%2214.2%22%20cy=%2220.8%22%20r=%22.95%22/%3E%3Ccircle%20cx=%2233.8%22%20cy=%2220.8%22%20r=%22.95%22/%3E%3Ccircle%20cx=%2213.6%22%20cy=%2227.4%22%20r=%22.85%22/%3E%3Ccircle%20cx=%2234.4%22%20cy=%2227.4%22%20r=%22.85%22/%3E%3Cpath%20d=%22M14.6%2022.9c1.4-2.2%204.7-2.4%206.8-.6-1.3%202.7-5.3%203.1-6.8.6Z%22/%3E%3Cpath%20d=%22M33.4%2022.9c-1.4-2.2-4.7-2.4-6.8-.6%201.3%202.7%205.3%203.1%206.8.6Z%22/%3E%3Cpath%20d=%22M20.9%2025.6c-1.5%203.4-2.6%206.3-3.3%209.2l-2.9-.8c.9-3.2%202.1-6.4%203.6-9.5Z%22/%3E%3Cpath%20d=%22M27.1%2025.6c1.5%203.4%202.6%206.3%203.3%209.2l2.9-.8c-.9-3.2-2.1-6.4-3.6-9.5Z%22/%3E%3Cpath%20d=%22M24%2027.4c1.7%200%202.8.8%202.8%202.1%200%201.5-1.7%202.8-2.8%202.8s-2.8-1.3-2.8-2.8c0-1.3%201.1-2.1%202.8-2.1Z%22/%3E%3C/g%3E%3Cpath%20d=%22M24%2032.3v2m0%200c-1.1%201.5-3.2%201.6-4.5.3m4.5-.3c1.1%201.5%203.2%201.6%204.5.3%22%20fill=%22none%22%20stroke=%22%23A2590D%22%20stroke-width=%221.6%22%20stroke-linecap=%22round%22%20stroke-linejoin=%22round%22/%3E%3C/svg%3E';

// Third-party wallet marks stay remote: they are those vendors' trademarks, so
// the SDK links them rather than embedding a redrawn copy.
export const LOGO_FREIGHTER = 'https://chettapay.vercel.app/assets/logo_freighter.png';
export const LOGO_ALBEDO = 'https://chettapay.vercel.app/assets/logo_albedo.svg';
