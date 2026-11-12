import type {P} from './recognize';

export type Size = {width: number; height: number};

/**
 * Screen pixels to page pixels. The pen's EMR coordinates follow the screen,
 * whatever the page: converted with the display size they give screen pixels.
 * A page made for another device is scaled to fill the screen (an A6X page,
 * 1404 × 1872, shown 1920 × 2560 on a Manta), and shapes are inserted in the
 * page's own pixels, so screen pixels are scaled by page / display. Measured
 * (A6X note on a Manta): converting with the page size instead put the shape
 * 516 px (1920 − 1404) to the left; converting with the display size alone,
 * 37 % too large (reported).
 */
export function screenToPage(q: P, display: Size, page: Size | null): P {
  if (!page) {
    return q;
  }
  return {x: (q.x * page.width) / display.width, y: (q.y * page.height) / display.height};
}
