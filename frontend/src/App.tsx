import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ScanProduct from './pages/ScanProduct';
import ProductDetail from './pages/ProductDetail';
import ManufacturerDashboard from './pages/ManufacturerDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Layout from './components/Layout';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/scan" element={<ScanProduct />} />
        <Route path="/product/:qrHash" element={<ProductDetail />} />
        <Route path="/manufacturer" element={<ManufacturerDashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Layout>
  );
}

export default App;
