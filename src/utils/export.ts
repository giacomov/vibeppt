/**
 * True when the app is being rendered for static export (?export=1 in the URL).
 * Looping animations should run once and stop; cyclic resets should be skipped.
 */
export const isExportMode: boolean = new URLSearchParams(window.location.search).has('export')
