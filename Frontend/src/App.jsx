import { useEffect, useState } from 'react';
import { useLocation, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home/Home';
import Shop from './pages/Shop/Shop';
import ProductDetails from "./components/ProductItem/ProductDetails";  // ← renamed
import Cart from './pages/Cart/Cart';
import Solar from './pages/Services/Solar';
import Service from './pages/Services/Service';
import Contact from './pages/Contact';
import PlaceOrder from './pages/PlaceOrder/PlaceOrder';
import Footer from './components/Footer/Footer';
import LoginPopup from './components/LoginPopup/LoginPopup';
import Verify from './pages/Verify/Verify';
import Support from './pages/Services/support';
import Ourteam from './pages/Services/ourteam';
import Feedback from './pages/Services/feedback';
import Aboutus from './pages/aboutus';
import Checkout from './pages/Checkout/Checkout';
import OrderSuccess from './pages/OrderSuccess/OrderSuccess';
import Privacypolicy from "./pages/privacypolicy";
import MyOrders from './pages/MyOrders/MyOrders';
import Blog from './pages/Blog';
import Services from './pages/Services/services';
import SolarForm from './pages/Services/solarform';
import ACService from './pages/Services/ACService';
import WashingMachineService from './pages/Services/WashingMachineService';
import WaterPurifierService from './pages/Services/WaterPurifierService';
import Refrigeratorservice from './pages/Services/RefrigeratorService';
import MyServiceRequests from './pages/MyServiceRequests/MyServiceRequests';
import ServiceBookingForm from './pages/Services/ServiceBookingForm';
import "bootstrap/dist/css/bootstrap.min.css";
import "./assets/css/style.css";



const App = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [theme, setTheme] = useState('dark');

  const ScrollToTop = () => {
    const { pathname } = useLocation();
    useEffect(() => {
      window.scrollTo(0, 0);
    }, [pathname]);
    return null;
  };

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div className={`app ${theme}`}>
      {showLogin ? <LoginPopup setShowLogin={setShowLogin} /> : <></>}
      <Navbar setShowLogin={setShowLogin} toggleTheme={toggleTheme} theme={theme} />
      <ScrollToTop />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/shop' element={<Shop />} />
        <Route path='/cart' element={<Cart />} />
        {/* ✅ Renamed from /food/:id to /product/:id */}
        <Route path='/product/:id' element={<ProductDetails />} />
        <Route path='/order' element={<PlaceOrder />} />
        <Route path='/verify' element={<Verify />} />
        <Route path='/myorders' element={<MyOrders />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/solar' element={<Solar />} />
        <Route path='/blog' element={<Blog />} />
        <Route path='/support' element={<Support />} />
        <Route path='/ourteam' element={<Ourteam />} />
        <Route path='/feedback' element={<Feedback />} />
        <Route path='/aboutus' element={<Aboutus />} />
        <Route path='/privacypolicy' element={<Privacypolicy />} />
        <Route path='/solarform' element={<SolarForm />} />
        <Route path='/Service' element={<Service />} />
        <Route path='/Services/ac' element={<ACService />} />
        <Route path='/Services/services' element={<Services />} />
        <Route path='/Services/washingMachine' element={<WashingMachineService />} />
        <Route path='/Services/waterPurifier' element={<WaterPurifierService />} />
        <Route path='/Services/refrigerator' element={<Refrigeratorservice />} />
        <Route path="/my-service-requests" element={<MyServiceRequests />} />
        <Route path="/service-booking-form" element={<ServiceBookingForm />} />
      </Routes>
      <Footer />
      
    </div>
  );
};

export default App;