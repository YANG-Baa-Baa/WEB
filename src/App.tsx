import { Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import { LinksProvider } from './contexts/linksContext';

export default function App() {
  return (
    <LinksProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/other" element={<div className="text-center text-xl">Other Page - Coming Soon</div>} />
      </Routes>
    </LinksProvider>
  );
}
