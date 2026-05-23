import { Routes, Route } from "react-router-dom";
import { NavBar } from "./components/NavBar";
import { BankAccount } from "./pages/BankAccount";
import { CreditCard } from "./pages/CreditCard";
import "./App.css";

function App() {
  return (
    <div className="app">
      <NavBar />
      <Routes>
        <Route path="/" element={<BankAccount />} />
        <Route path="/cards" element={<CreditCard />} />
      </Routes>
    </div>
  );
}

export default App;
