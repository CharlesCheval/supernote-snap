import {screenToPage} from '../src/pagemap';

const manta = {width: 1920, height: 2560};
const a6x = {width: 1404, height: 1872};

test('an A6X page on a Manta: screen pixels scaled to the page (measured stroke)', () => {
  // A circle drawn at x 567–812, y 768–1002 on the Manta screen (diagnostic build).
  const tl = screenToPage({x: 567, y: 768}, manta, a6x);
  const br = screenToPage({x: 812, y: 1002}, manta, a6x);
  expect(tl.x).toBeCloseTo(414.6, 1);
  expect(tl.y).toBeCloseTo(561.6, 1);
  expect(br.x).toBeCloseTo(593.8, 1);
  expect(br.y).toBeCloseTo(732.7, 1);
});

test('a page of the device itself, or no page size: unchanged', () => {
  expect(screenToPage({x: 567, y: 768}, manta, manta)).toEqual({x: 567, y: 768});
  expect(screenToPage({x: 567, y: 768}, manta, null)).toEqual({x: 567, y: 768});
});
