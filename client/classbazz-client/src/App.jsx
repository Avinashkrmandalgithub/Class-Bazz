import react from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Join from "./pages/Join";
import Room from "./pages/Room";
import { UserProvider } from './context/UserContext.jsx';

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<Join />} />
        <Route path="/room" element={<Room />} />
      </Routes>
    </BrowserRouter>
    </UserProvider>
    
  );
}

export default App;
