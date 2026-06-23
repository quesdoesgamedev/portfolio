import type { AnimationStep } from '../../types';

/**
 * Bubble Sort
 * Time complexity: O(n²) | Space: O(1)
 *
 * Returns a list of animation steps so the visualizer can
 * replay what the algorithm did, one frame at a time.
 */
export function bubbleSort(array: number[]): AnimationStep[] {
  const steps: AnimationStep[] = [];
  const arr = [...array];
  const n = arr.length;

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      // Highlight the two bars being compared
      steps.push({ indices: [j, j + 1], state: 'comparing' });

      if (arr[j] > arr[j + 1]) {
        // Swap
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        steps.push({
          indices: [j, j + 1],
          state: 'comparing',
          newValues: [...arr],
        });
      }

      // Reset those bars back to default
      steps.push({ indices: [j, j + 1], state: 'default' });
    }

    // Mark the last unsorted element as sorted
    steps.push({ indices: [n - i - 1], state: 'sorted' });
  }

  // Mark the final element as sorted
  steps.push({ indices: [0], state: 'sorted' });

  return steps;
}
