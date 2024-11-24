import "./App.css";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import EchoteFeed2 from "./components/feed/feed2";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/*<Route path="" element={<HomePage />} />*/}
        <Route path="/" element={<EchoteFeed2 />} />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  );
}
