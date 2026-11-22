import { describe, expect, it } from 'vitest';
import { standaloneHeight } from './viewport';

const iphone = { standalone: true, portrait: true, innerWidth: 402, screenW: 402, screenH: 874 };

describe('standaloneHeight', () => {
  it('fills the screen when the Home Screen app is one status bar short', () => {
    expect(standaloneHeight({ ...iphone, innerHeight: 812 })).toBe(874);
  });
  it('leaves a correct height alone', () => {
    expect(standaloneHeight({ ...iphone, innerHeight: 874 })).toBeNull();
  });
  it('leaves Safari tabs, landscape and iPad split view alone', () => {
    expect(standaloneHeight({ ...iphone, standalone: false, innerHeight: 760 })).toBeNull();
    expect(standaloneHeight({ ...iphone, portrait: false, innerWidth: 874, innerHeight: 402 })).toBeNull();
    expect(standaloneHeight({ standalone: true, portrait: true, innerWidth: 507, innerHeight: 1150, screenW: 1024, screenH: 1366 })).toBeNull();
    expect(standaloneHeight({ ...iphone, innerHeight: 500 })).toBeNull();
  });
});
