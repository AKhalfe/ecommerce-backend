import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

function QRPage() {
  const url = 'http://localhost:3000';

  const print = () => {
    window.print();
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif' }}>
      <div style={{ background: '#fff', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', textAlign: 'center', maxWidth: '400px', width: '100%' }}>
        <div style={{ fontSize: '36px', marginBottom: '8px' }}>🏭</div>
        <h1 style={{ margin: '0 0 4px', color: '#0d47a1', fontSize: '24px' }}>Warehouse System</h1>
        <p style={{ margin: '0 0 24px', color: '#888', fontSize: '14px' }}>Scan to access the customer portal</p>

        <div style={{ background: '#f9f9f9', padding: '24px', borderRadius: '12px', display: 'inline-block', marginBottom: '24px', border: '2px solid #e0e0e0' }}>
          <QRCodeSVG value={url} size={220} level="H" includeMargin={true}
            imageSettings={{ src: '', height: 24, width: 24, excavate: true }} />
        </div>

        <p style={{ margin: '0 0 8px', color: '#555', fontSize: '13px' }}>Scan this QR code with your phone</p>
        <p style={{ margin: '0 0 24px', color: '#0d47a1', fontSize: '13px', fontWeight: 'bold' }}>{url}</p>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={print}
            style={{ flex: 1, padding: '12px', background: '#0d47a1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontFamily: 'Georgia, serif' }}>
            Print QR Code
          </button>
          <a href="/" style={{ flex: 1 }}>
            <button style={{ width: '100%', padding: '12px', background: '#2e7d32', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontFamily: 'Georgia, serif' }}>
              Go to Login
            </button>
          </a>
        </div>
      </div>
    </div>
  );
}

export default QRPage;