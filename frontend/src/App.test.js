import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Quagga from 'quagga';

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const scannerRef = useRef(null);

  useEffect(() => {
    axios.get('http://localhost:5000/api/products')
      .then(res => setProducts(res.data))
      .catch(err => console.log(err));
  }, []);

  const categories = ['All', ...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(p => {
    const matchCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode.includes(search);
    return matchCategory && matchSearch;
  });

  const addToCart = (product) => {
    const exists = cart.find(item => item._id === product._id);
    if (exists) {
      setCart(cart.map(item =>
        item._id === product._id
          ? { ...item, qty: item.qty + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item._id !== id));
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const startScanner = () => {
    setScanning(true);
    setTimeout(() => {
      Quagga.init({
        inputStream: {
          type: 'LiveStream',
          target: scannerRef.current,
          constraints: { facingMode: 'environment' }
        },
        decoder: { readers: ['ean_reader', 'code_128_reader'] }
      }, (err) => {
        if (err) { console.log(err); return; }
        Quagga.start();
      });
      Quagga.onDetected((result) => {
        const code = result.codeResult.code;
        setScanResult(code);
        Quagga.stop();
        setScanning(false);
        const found = products.find(p => p.barcode === code);
        if (found) {
          addToCart(found);
          alert('Product added: ' + found.name);
        } else {
          alert('Product not found for barcode: ' + code);
        }
      });
    }, 500);
  };

  const stopScanner = () => {
    Quagga.stop();
    setScanning(false);
  };

  return (
    <div style={{ display: 'flex', padding: '20px', gap: '20px' }}>

      {/* Left Section */}
      <div style={{ flex: 2 }}>
        <h1>Warehouse System</h1>

        {/* Barcode Scanner */}
        <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <h2>Barcode Scanner</h2>
          {scanResult && <p>Last scanned: <b>{scanResult}</b></p>}
          {!scanning ? (
            <button onClick={startScanner} style={{ padding: '10px 20px', background: 'purple', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              Start Scanner
            </button>
          ) : (
            <button onClick={stopScanner} style={{ padding: '10px 20px', background: 'red', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              Stop Scanner
            </button>
          )}
          <div ref={scannerRef} style={{ marginTop: '10px', width: '100%', height: scanning ? '300px' : '0px', overflow: 'hidden' }} />
        </div>

        {/* Search and Filter */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search by name or barcode..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, padding: '8px 12px', fontSize: '15px', borderRadius: '6px', border: '1px solid #ccc' }}
          />
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            style={{ padding: '8px 16px', fontSize: '15px', borderRadius: '6px', border: '1px solid #ccc', cursor: 'pointer' }}>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Products List */}
        <h2>
          Products ({filteredProducts.length})
          {selectedCategory !== 'All' && ` - ${selectedCategory}`}
        </h2>

        {filteredProducts.length === 0 ? (
          <p>No products found.</p>
        ) : (
          filteredProducts.map(p => (
            <div key={p._id} style={{ border: '1px solid #ccc', margin: '10px 0', padding: '10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0 }}>{p.name}</h3>
                <p style={{ margin: 0, color: '#666' }}>Category: {p.category}</p>
                <p style={{ margin: 0 }}>Price: Rs.{p.price}</p>
                <p style={{ margin: 0 }}>Stock: {p.stock}</p>
                <p style={{ margin: 0, color: '#999' }}>Barcode: {p.barcode}</p>
              </div>
              <button onClick={() => addToCart(p)} style={{ padding: '8px 16px', background: 'green', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                Add to Cart
              </button>
            </div>
          ))
        )}
      </div>

      {/* Cart Section */}
      <div style={{ flex: 1, border: '1px solid #ccc', padding: '20px', borderRadius: '8px', height: 'fit-content', position: 'sticky', top: '20px' }}>
        <h2>Cart ({cart.length} items)</h2>
        {cart.length === 0 ? (
          <p>Cart is empty</p>
        ) : (
          <>
            {cart.map(item => (
              <div key={item._id} style={{ borderBottom: '1px solid #eee', padding: '8px 0', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 'bold' }}>{item.name}</p>
                  <p style={{ margin: 0, color: '#666' }}>Rs.{item.price} x {item.qty} = Rs.{item.price * item.qty}</p>
                </div>
                <button onClick={() => removeFromCart(item._id)} style={{ background: 'red', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '4px 8px' }}>
                  X
                </button>
              </div>
            ))}
            <h3 style={{ borderTop: '2px solid #333', paddingTop: '10px' }}>Total: Rs.{totalAmount}</h3>
            <button style={{ width: '100%', padding: '10px', background: 'blue', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px' }}>
              Checkout
            </button>
          </>
        )}
      </div>

    </div>
  );
}

export default App;