/**
 * Opened from the Home Screen, newer iPhones report a page height one status bar short of the
 * screen (100%, vh and innerHeight all leave a band under the dock). There the app fills the
 * whole screen itself. Only when the window is the full screen width and the gap is about a
 * status bar tall, so iPad split view and normal Safari are left alone.
 */
export function standaloneHeight(o: { standalone: boolean; portrait: boolean; innerWidth: number; innerHeight: number; screenW: number; screenH: number }): number | null {
  if (!o.standalone || !o.portrait) return null;
  const full = Math.max(o.screenW, o.screenH);
  const across = Math.min(o.screenW, o.screenH);
  const gap = full - o.innerHeight;
  return Math.abs(o.innerWidth - across) <= 1 && gap > 0 && gap <= 80 ? full : null;
}
