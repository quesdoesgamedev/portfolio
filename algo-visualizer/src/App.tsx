import './App.css'
import SortVisualizer from './components/SortVisualizer'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Algorithm Visualizer</h1>
        <p>Sorting &amp; pathfinding algorithms, animated step-by-step</p>
      </header>
      <main className="app-main">
        <SortVisualizer />
      </main>
    </div>
  )
}

export default App
