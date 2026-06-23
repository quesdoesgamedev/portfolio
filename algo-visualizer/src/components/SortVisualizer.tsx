import { useState, useCallback, useRef } from 'react'
import type { Bar } from '../types'
import { bubbleSort } from '../algorithms/sorting/bubbleSort'
import './SortVisualizer.css'

const ARRAY_SIZE = 60
const DEFAULT_SPEED = 50 // ms per animation step

// Build a fresh randomized array
function generateArray(size: number): Bar[] {
  return Array.from({ length: size }, () => ({
    value: Math.floor(Math.random() * 90) + 10,
    state: 'default' as const,
  }))
}

export default function SortVisualizer() {
  const [bars, setBars] = useState<Bar[]>(() => generateArray(ARRAY_SIZE))
  const [isRunning, setIsRunning] = useState(false)
  const [speed, setSpeed] = useState(DEFAULT_SPEED)

  // Ref lets us cancel a running animation
  const cancelRef = useRef(false)

  const handleRandomize = useCallback(() => {
    cancelRef.current = true // stop any in-progress animation
    setBars(generateArray(ARRAY_SIZE))
    setIsRunning(false)
  }, [])

  const handleSort = useCallback(async () => {
    cancelRef.current = false
    setIsRunning(true)

    // Get the current raw values and run the algorithm
    const values = bars.map(b => b.value)
    const steps = bubbleSort(values)

    // Replay each step with a delay
    for (const step of steps) {
      if (cancelRef.current) break

      await new Promise(resolve => setTimeout(resolve, speed))

      setBars(prev => {
        const next = [...prev]

        // Apply optional value swap first
        if (step.newValues) {
          step.newValues.forEach((val, i) => {
            next[i] = { ...next[i], value: val }
          })
        }

        // Apply the highlight state to the relevant indices
        step.indices.forEach(i => {
          // Don't overwrite bars that are already marked sorted
          if (next[i].state !== 'sorted') {
            next[i] = { ...next[i], state: step.state }
          }
        })

        return next
      })
    }

    setIsRunning(false)
  }, [bars, speed])

  return (
    <div className="sort-visualizer">
      {/* Bar display */}
      <div className="bar-container">
        {bars.map((bar, i) => (
          <div
            key={i}
            className={`bar bar--${bar.state}`}
            style={{ height: `${bar.value}%` }}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="controls">
        <button className="primary" onClick={handleSort} disabled={isRunning}>
          {isRunning ? 'Sorting…' : 'Sort (Bubble)'}
        </button>
        <button onClick={handleRandomize}>
          Randomize
        </button>
        <label>
          Speed
          <input
            type="range"
            min={5}
            max={200}
            value={speed}
            onChange={e => setSpeed(Number(e.target.value))}
            disabled={isRunning}
          />
        </label>
      </div>
    </div>
  )
}
