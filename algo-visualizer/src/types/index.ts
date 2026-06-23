// Visual state of a single bar in the array
export type BarState = 'default' | 'comparing' | 'sorted' | 'pivot';

// A single element in the array being sorted
export interface Bar {
  value: number;  // 1–100, determines bar height
  state: BarState;
}

// A single animation frame produced by an algorithm
export interface AnimationStep {
  // Indices involved in this step (e.g. the two bars being compared or swapped)
  indices: number[];
  // The new state to apply to those indices
  state: BarState;
  // Optional: new array values after a swap
  newValues?: number[];
}
