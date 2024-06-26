import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import PokemonList from './pokemon/PokemonList';
import PokemonDetails from './pokemon/PokemonDetails.tsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PokemonList />} />
        <Route path="/pokemon/:id" element={<PokemonDetails />} />
      </Routes>
    </Router>
  );
}

export default App;