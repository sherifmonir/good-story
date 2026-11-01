import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

window.scrollTo = vi.fn();
Element.prototype.scrollIntoView = vi.fn();
