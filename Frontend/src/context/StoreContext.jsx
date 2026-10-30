import { createContext, useState, useEffect } from 'react';
import api from '../api/client';

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  // ═══ CONSTANTS ═══
  const url = "http://localhost:8000";

  // ═══ STATE ═══
  const [cartItems, setCartItems] = useState({});
  const [product_list, setProductList] = useState([]);
  const [token, setToken] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ═══════════════════════════════════════════════════
  // LOAD FROM LOCALSTORAGE ON MOUNT
  // ═══════════════════════════════════════════════════
  useEffect(() => {
    // Cart
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (err) {
        console.error('Failed to parse cartItems:', err);
        localStorage.removeItem('cartItems');
      }
    }

    // Token
    const savedToken =
      localStorage.getItem('customerToken') ||
      localStorage.getItem('token') ||
      localStorage.getItem('vendorToken') ||
      localStorage.getItem('adminToken');

    if (savedToken) setToken(savedToken);

    // User
    const savedUser = localStorage.getItem('customerUser');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error('Failed to parse user:', err);
      }
    }
  }, []);

  // ═══════════════════════════════════════════════════
  // FETCH PRODUCTS ON MOUNT
  // ═══════════════════════════════════════════════════
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get('/api/products');
        const list = Array.isArray(data) ? data : data.products || [];
        setProductList(list);
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // ═══════════════════════════════════════════════════
  // PERSIST CART
  // ═══════════════════════════════════════════════════
  useEffect(() => {
    if (Object.keys(cartItems).length > 0 || localStorage.getItem('cartItems')) {
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }
  }, [cartItems]);

  // ═══════════════════════════════════════════════════
  // PERSIST TOKEN + USER
  // ═══════════════════════════════════════════════════
  useEffect(() => {
    if (token) localStorage.setItem('customerToken', token);
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem('customerUser', JSON.stringify(user));
  }, [user]);

  // ═══════════════════════════════════════════════════
  // CART OPERATIONS
  // ═══════════════════════════════════════════════════
  const addToCart = (itemId) => {
    setCartItems((prev) => {
      const updated = { ...prev };
      updated[itemId] = (updated[itemId] || 0) + 1;
      return updated;
    });
  };

  const removeFromCart = (itemId) => {
    setCartItems((prev) => {
      const updated = { ...prev };
      if (!updated[itemId]) return prev;
      if (updated[itemId] > 1) {
        updated[itemId] -= 1;
      } else {
        delete updated[itemId];
      }
      return updated;
    });
  };

  const removeItemCompletely = (itemId) => {
    setCartItems((prev) => {
      const updated = { ...prev };
      delete updated[itemId];
      return updated;
    });
  };

  const clearCart = () => {
    setCartItems({});
    localStorage.removeItem('cartItems');
  };

  const getCartCount = () => {
    return Object.values(cartItems).reduce((sum, qty) => sum + qty, 0);
  };

  const getCartTotal = () => {
    return Object.entries(cartItems).reduce((sum, [id, qty]) => {
      const product = product_list.find((p) => String(p.id) === String(id));
      if (!product) return sum;
      const price = product.final_price || product.price || 0;
      return sum + price * qty;
    }, 0);
  };

  const getCartArray = () => {
    return Object.entries(cartItems)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => {
        const product = product_list.find((p) => String(p.id) === String(id));
        if (!product) return null;
        return { ...product, quantity: qty };
      })
      .filter(Boolean);
  };

  // ═══════════════════════════════════════════════════
  // AUTH OPERATIONS
  // ═══════════════════════════════════════════════════
  const login = (tokenValue, userData) => {
    setToken(tokenValue);
    if (userData) setUser(userData);
    localStorage.setItem('customerToken', tokenValue);
    if (userData) localStorage.setItem('customerUser', JSON.stringify(userData));
  };

  const logout = () => {
    setToken('');
    setUser(null);
    setCartItems({});
    localStorage.removeItem('customerToken');
    localStorage.removeItem('token');
    localStorage.removeItem('customerUser');
    localStorage.removeItem('cartItems');
  };

  // ═══════════════════════════════════════════════════
  // CONTEXT VALUE
  // ═══════════════════════════════════════════════════
  const contextValue = {
    // ═══ URL ═══
    url,

    // ═══ Products ═══
    product_list,
    setProductList,
    loading,

    // ═══ Cart ═══
    cartItems,
    addToCart,
    removeFromCart,
    removeItemCompletely,
    clearCart,
    getCartCount,
    getCartTotal,
    getCartArray,

    // ═══ Auth ═══
    token,
    setToken,
    user,
    setUser,
    login,
    logout,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;