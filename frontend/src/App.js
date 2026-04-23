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
  const [view, setView] = useState('list');
  const [showReceipt, setShowReceipt] = useState(false);
  const scannerRef = useRef(null);
  const receiptRef = useRef(null);

  useEffect(() => {
    axios.get('http://localhost:5000/api/products')
      .then(res => setProducts(res.data))
      .catch(err => console.log(err));
  }, []);

  const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];

  const filteredProducts = products.filter(p => {
    const matchCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || String(p.barcode).includes(search);
    return matchCategory && matchSearch;
  });

  const groupedByCategory = categories.filter(c => c !== 'All').reduce((acc, cat) => {
    const items = filteredProducts.filter(p => p.category === cat);
    if (items.length > 0) acc[cat] = items;
    return acc;
  }, {});

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
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const now = new Date();
  const receiptDate = now.toLocaleDateString();
  const receiptTime = now.toLocaleTimeString();
  const receiptNo = 'INV-' + Date.now().toString().slice(-6);

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Cart is empty!');
      return;
    }
    setShowReceipt(true);
  };

  const handlePrint = () => {
    const printContents = receiptRef.current.innerHTML;
    const printWindow = window.open('', '', 'width=400,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt</title>
          <style>
            body { font-family: monospace; font-size: 13px; padding: 20px; width: 300px; margin: auto; }
            h2 { text-align: center; margin: 4px 0; }
            p { margin: 2px 0; }
            .center { text-align: center; }
            .line { border-top: 1px dashed #000; margin: 8px 0; }
            .row { display: flex; justify-content: space-between; }
            .total { font-weight: bold; font-size: 15px; }
            .footer { text-align: center; margin-top: 10px; font-size: 11px; }
          </style>
        </head>
        <body>${printContents}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const handleNewSale = () => {
    setCart([]);
    setShowReceipt(false);
  };

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

  const ProductCard = ({ p }) => (
    <div style={{ border: '1px solid #ddd', margin: '6px 0', padding: '10px 14px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
      <div>
        <p style={{ margin: 0, fontWeight: 'bold', fontSize: '14px' }}>{p.name}</p>
        <p style={{ margin: 0, color: '#888', fontSize: '12px' }}>Barcode: {p.barcode} | Stock: {p.stock}</p>
        <p style={{ margin: 0, color: '#333', fontSize: '13px' }}>Rs. {p.price}</p>
      </div>
      <button onClick={() => addToCart(p)} style={{ padding: '6px 14px', background: '#2e7d32', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
        + Add
      </button>
    </div>
  );

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>

      {/* Left Section */}
      <div style={{ flex: 2, overflowY: 'auto', padding: '20px', background: '#f5f5f5' }}>
        <h1 style={{ margin: '0 0 16px' }}>Warehouse System</h1>

        {/* Barcode Scanner */}
        <div style={{ background: '#fff', border: '1px solid #ddd', padding: '14px', borderRadius: '8px', marginBottom: '16px' }}>
          <h2 style={{ margin: '0 0 10px' }}>Barcode Scanner</h2>
          {scanResult && <p style={{ margin: '0 0 8px', color: 'green' }}>Last scanned: <b>{scanResult}</b></p>}
          {!scanning ? (
            <button onClick={startScanner} style={{ padding: '8px 18px', background: 'purple', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              Start Scanner
            </button>
          ) : (
            <button onClick={stopScanner} style={{ padding: '8px 18px', background: 'red', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              Stop Scanner
            </button>
          )}
          <div ref={scannerRef} style={{ marginTop: '10px', width: '100%', height: scanning ? '280px' : '0px', overflow: 'hidden' }} />
        </div>

        {/* Search and Filter */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
          <input
            type="text"
            placeholder="Search by name or barcode..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, padding: '8px 12px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ccc' }}
          />
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            style={{ padding: '8px 12px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ccc', cursor: 'pointer' }}>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <button
            onClick={() => setView(view === 'list' ? 'grouped' : 'list')}
            style={{ padding: '8px 14px', background: '#1565c0', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
            {view === 'list' ? 'Group View' : 'List View'}
          </button>
        </div>

        {/* Products */}
        {view === 'list' ? (
          <>
            <h2 style={{ margin: '0 0 10px' }}>
              Products ({filteredProducts.length})
              {selectedCategory !== 'All' && ` — ${selectedCategory}`}
            </h2>
            {filteredProducts.length === 0 ? (
              <p>No products found.</p>
            ) : (
              filteredProducts.map(p => <ProductCard key={p._id} p={p} />)
            )}
          </>
        ) : (
          <>
            <h2 style={{ margin: '0 0 10px' }}>Products by Department</h2>
            {Object.entries(groupedByCategory).map(([cat, items]) => (
              <div key={cat} style={{ marginBottom: '20px' }}>
                <div style={{ background: '#1565c0', color: 'white', padding: '8px 14px', borderRadius: '6px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 'bold' }}>{cat}</span>
                  <span>{items.length} items</span>
                </div>
                {items.map(p => <ProductCard key={p._id} p={p} />)}
              </div>
            ))}
          </>
        )}
      </div>

      {/* Cart Section */}
      <div style={{ width: '320px', borderLeft: '1px solid #ddd', padding: '20px', background: '#fff', overflowY: 'auto' }}>
        <h2 style={{ margin: '0 0 16px' }}>Cart ({cart.length} items)</h2>
        {cart.length === 0 ? (
          <p style={{ color: '#999' }}>Cart is empty</p>
        ) : (
          <>
            {cart.map(item => (
              <div key={item._id} style={{ borderBottom: '1px solid #eee', padding: '10px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 'bold', fontSize: '13px' }}>{item.name}</p>
                  <p style={{ margin: 0, color: '#666', fontSize: '12px' }}>Rs.{item.price} x {item.qty} = Rs.{item.price * item.qty}</p>
                </div>
                <button onClick={() => removeFromCart(item._id)} style={{ background: 'red', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '4px 8px', marginLeft: '8px' }}>
                  X
                </button>
              </div>
            ))}
            <div style={{ borderTop: '2px solid #333', marginTop: '10px', paddingTop: '10px' }}>
              <p style={{ margin: '0 0 4px' }}>Items: {totalItems}</p>
              <h3 style={{ margin: '0 0 12px' }}>Total: Rs.{totalAmount}</h3>
              <button
                onClick={handleCheckout}
                style={{ width: '100%', padding: '12px', background: '#1565c0', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '15px' }}>
                Checkout & Print Receipt
              </button>
            </div>
          </>
        )}
      </div>

      {/* Receipt Modal */}
      {showReceipt && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '30px', borderRadius: '10px', width: '360px', maxHeight: '90vh', overflowY: 'auto' }}>

            {/* Receipt Content */}
            <div ref={receiptRef}>
              <h2 style={{ textAlign: 'center', margin: '0 0 4px' }}>WAREHOUSE SYSTEM</h2>
              <p style={{ textAlign: 'center', margin: '0 0 2px', fontSize: '12px' }}>Thank you for your purchase!</p>
              <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }}></div>
              <p style={{ margin: '2px 0', fontSize: '12px' }}>Receipt No: {receiptNo}</p>
              <p style={{ margin: '2px 0', fontSize: '12px' }}>Date: {receiptDate}</p>
              <p style={{ margin: '2px 0', fontSize: '12px' }}>Time: {receiptTime}</p>
              <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '12px', marginBottom: '4px' }}>
                <span>Item</span>
                <span>Qty</span>
                <span>Amount</span>
              </div>
              {cart.map(item => (
                <div key={item._id}>
                  <p style={{ margin: '2px 0', fontSize: '12px' }}>{item.name}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#555' }}>
                    <span>Rs.{item.price} each</span>
                    <span>{item.qty}</span>
                    <span>Rs.{item.price * item.qty}</span>
                  </div>
                </div>
              ))}
              <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span>Total Items:</span>
                <span>{totalItems}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '15px', marginTop: '4px' }}>
                <span>TOTAL:</span>
                <span>Rs.{totalAmount}</span>
              </div>
              <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }}></div>
              <p style={{ textAlign: 'center', fontSize: '11px', margin: '4px 0' }}>*** Thank You — Visit Again! ***</p>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={handlePrint}
                style={{ flex: 1, padding: '10px', background: '#2e7d32', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>
                Print Receipt
              </button>
              <button
                onClick={handleNewSale}
                style={{ flex: 1, padding: '10px', background: '#1565c0', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>
                New Sale
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;