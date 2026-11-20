// "Add to Home Screen" support: offline service worker, the Android install prompt,
// and the steps iPhone players need (Safari has no install button of its own).

interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferred: InstallPromptEvent | null = null;

export function isInstalled(): boolean {
  const nav = navigator as Navigator & { standalone?: boolean };
  return nav.standalone === true || matchMedia('(display-mode: standalone)').matches;
}

export function isIOS(): boolean {
  const ua = navigator.userAgent;
  return /iPhone|iPad|iPod/.test(ua) || (ua.includes('Macintosh') && navigator.maxTouchPoints > 1);
}

/** True when the browser can show its own install prompt (Chrome on Android, desktop Chrome/Edge). */
export const canPrompt = (): boolean => deferred !== null;

export async function promptInstall(): Promise<boolean> {
  if (!deferred) return false;
  const ev = deferred;
  deferred = null;
  await ev.prompt();
  return (await ev.userChoice).outcome === 'accepted';
}

export function setupInstall(): void {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e as InstallPromptEvent;
  });
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {
        /* offline play just isn't available */
      });
    });
  }
}

const SHARE_ICON = `<svg viewBox="0 0 24 24" class="ui-icon inline" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12"/><path d="m8 7 4-4 4 4"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg>`;

/** Step-by-step words for this device, or '' when it is already installed. */
export function installSteps(): string {
  if (isInstalled()) return '';
  if (isIOS())
    return `<ol class="install-steps"><li>Tap the Share button ${SHARE_ICON} in Safari’s toolbar.</li><li>Scroll down and tap <b>Add to Home Screen</b>.</li><li>Open Micah Madness from her new icon.</li></ol>`;
  if (canPrompt()) return '';
  return `<ol class="install-steps"><li>Open your browser’s menu (⋮).</li><li>Tap <b>Install app</b> or <b>Add to Home screen</b>.</li></ol>`;
}
