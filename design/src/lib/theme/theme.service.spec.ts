import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

const STORAGE_KEY = 'rp-theme';
const root = document.documentElement;

/** Create the service fresh (it reads initial mode in its field initializer). */
function createService(): ThemeService {
  TestBed.configureTestingModule({});
  return TestBed.inject(ThemeService);
}

/** Flush root effects so data-theme / persistence side-effects run. */
function flushEffects(): void {
  TestBed.tick();
}

describe('ThemeService', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
    localStorage.clear();
    root.removeAttribute('data-theme');
    root.removeAttribute('style');
    vi.restoreAllMocks();
    // jsdom has no matchMedia; default to "no dark preference".
    window.matchMedia = vi
      .fn()
      .mockReturnValue({ matches: false }) as unknown as typeof window.matchMedia;
  });

  describe('initial mode', () => {
    it('uses a persisted "dark" preference', () => {
      localStorage.setItem(STORAGE_KEY, 'dark');
      expect(createService().mode()).toBe('dark');
    });

    it('uses a persisted "light" preference', () => {
      localStorage.setItem(STORAGE_KEY, 'light');
      expect(createService().mode()).toBe('light');
    });

    it('falls back to the OS preference when nothing is persisted', () => {
      window.matchMedia = vi
        .fn()
        .mockReturnValue({ matches: true }) as unknown as typeof window.matchMedia;
      expect(createService().mode()).toBe('dark');
    });

    it('defaults to "light" when no preference and no OS hint', () => {
      // beforeEach already stubs matchMedia -> { matches: false }
      expect(createService().mode()).toBe('light');
    });

    it('ignores a corrupt persisted value', () => {
      localStorage.setItem(STORAGE_KEY, 'banana');
      expect(createService().mode()).toBe('light');
    });
  });

  describe('setMode / toggle', () => {
    it('reflects the mode onto <html data-theme> and persists it', () => {
      const svc = createService();
      svc.setMode('dark');
      flushEffects();

      expect(root.getAttribute('data-theme')).toBe('dark');
      expect(localStorage.getItem(STORAGE_KEY)).toBe('dark');
    });

    it('toggle() flips between light and dark', () => {
      localStorage.setItem(STORAGE_KEY, 'light');
      const svc = createService();

      svc.toggle();
      expect(svc.mode()).toBe('dark');
      expect(svc.isDark()).toBe(true);

      svc.toggle();
      expect(svc.mode()).toBe('light');
      expect(svc.isDark()).toBe(false);
    });

    it('isDark mirrors the current mode', () => {
      localStorage.setItem(STORAGE_KEY, 'dark');
      expect(createService().isDark()).toBe(true);
    });
  });

  describe('white-label brand override', () => {
    it('applyBrand sets the brand custom properties', () => {
      const svc = createService();
      svc.applyBrand({ brand: '#123456', brandHover: '#0a1a2a' });

      expect(root.style.getPropertyValue('--rp-brand')).toBe('#123456');
      expect(root.style.getPropertyValue('--rp-color-brand-600')).toBe('#123456');
      expect(root.style.getPropertyValue('--rp-brand-hover')).toBe('#0a1a2a');
    });

    it('applyBrand only touches the keys it is given', () => {
      const svc = createService();
      svc.applyBrand({ brand: '#abcdef' });

      expect(root.style.getPropertyValue('--rp-brand')).toBe('#abcdef');
      expect(root.style.getPropertyValue('--rp-brand-hover')).toBe('');
    });

    it('clearBrand reverts to the design-system default', () => {
      const svc = createService();
      svc.applyBrand({ brand: '#123456', brandHover: '#0a1a2a' });
      svc.clearBrand();

      expect(root.style.getPropertyValue('--rp-brand')).toBe('');
      expect(root.style.getPropertyValue('--rp-color-brand-600')).toBe('');
      expect(root.style.getPropertyValue('--rp-brand-hover')).toBe('');
    });
  });
});
