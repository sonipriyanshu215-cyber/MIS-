// Run: node seed.js
// Seeds the MIS Firestore database with initial demo data

const https = require('https');

const PROJECT_ID   = 'misdb-0077';
const API_KEY      = 'AIzaSyAZErauDH1fVCxxmOUCa_PuTXVpkCLL8yA';
const ADMIN_EMAIL  = 'admin@mis.app';
const ADMIN_PASS   = 'Admin@123';

const defaultState = {
  vendors: [
    { id: 'v1', name: 'TechVision Pvt Ltd',   contact: 'Raj Sharma',   phone: '+91 98765 43210', email: 'raj@techvision.in',    city: 'Mumbai',    type: 'Manufacturer', rating: 5 },
    { id: 'v2', name: 'GlobalSupply Co.',      contact: 'Priya Nair',   phone: '+91 87654 32109', email: 'priya@globalsupply.com', city: 'Delhi',   type: 'Distributor',  rating: 4 },
    { id: 'v3', name: 'QuickMart Wholesale',   contact: 'Anil Kumar',   phone: '+91 76543 21098', email: 'anil@quickmart.in',    city: 'Bengaluru', type: 'Wholesaler',   rating: 4 },
    { id: 'v4', name: 'EastEdge Imports',      contact: 'Meera Singh',  phone: '+91 65432 10987', email: 'meera@eastedge.com',   city: 'Chennai',   type: 'Importer',     rating: 3 }
  ],
  products: [
    { id: 'p1', name: 'Smart Watch Pro X1',    price: 8999,  category: 'Electronics', stock: 85, desc: 'Advanced smartwatch with health monitoring, GPS, and 7-day battery life.', specs: [['Display','1.4" AMOLED'],['Battery','420mAh / 7 days'],['Water Resistance','5ATM'],['Connectivity','BT 5.0 + GPS']], vendors: ['v1','v2'], image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=80' },
    { id: 'p2', name: 'Wireless Earbuds Neo',  price: 2499,  category: 'Electronics', stock: 12, desc: 'True wireless earbuds with ANC and 30hr total playtime.',                  specs: [['Driver Size','10mm'],['ANC','Yes'],['Playtime','30hrs total'],['Charge Time','1.5 hrs']], vendors: ['v1','v3'], image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300&q=80' },
    { id: 'p3', name: 'Ergonomic Office Chair',price: 15999, category: 'Furniture',   stock: 23, desc: 'Fully adjustable mesh chair with lumbar support.',                          specs: [['Material','Mesh + Steel'],['Max Load','120 kg'],['Adjustable','Height, Armrest, Tilt'],['Warranty','2 years']], vendors: ['v2','v4'], image: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=300&q=80' },
    { id: 'p4', name: 'Industrial Drill Set',  price: 4599,  category: 'Tools',       stock: 6,  desc: '18V cordless drill with 25-piece accessory kit.',                           specs: [['Voltage','18V'],['Speed','0-1500 RPM'],['Chuck','13mm Keyless'],['Bits Included','25']], vendors: ['v3','v4'], image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=300&q=80' }
  ],
  orders: [
    { id: 'ORD-001', productId: 'p1', vendorId: 'v1', qty: 10, total: 89990,  customer: 'IT Department', address: 'Block A, Head Office, Mumbai',   priority: 'high',   notes: 'Bulk purchase for Q1',       status: 'delivered',  date: '2026-05-15', statusHistory: ['pending','approved','processing','shipped','delivered'] },
    { id: 'ORD-002', productId: 'p2', vendorId: 'v3', qty: 25, total: 62475,  customer: 'HR Department', address: 'Level 3, South Wing, Delhi',     priority: 'normal', notes: '',                           status: 'shipped',    date: '2026-05-28', statusHistory: ['pending','approved','processing','shipped'] },
    { id: 'ORD-003', productId: 'p3', vendorId: 'v2', qty: 5,  total: 79995,  customer: 'Admin Dept',    address: 'New Office, Bengaluru',          priority: 'urgent', notes: 'Need before inauguration',   status: 'processing', date: '2026-06-01', statusHistory: ['pending','approved','processing'] },
    { id: 'ORD-004', productId: 'p4', vendorId: 'v4', qty: 3,  total: 13797,  customer: 'Maintenance',   address: 'Warehouse, Chennai',             priority: 'normal', notes: '',                           status: 'approved',   date: '2026-06-02', statusHistory: ['pending','approved'] },
    { id: 'ORD-005', productId: 'p1', vendorId: 'v2', qty: 2,  total: 17998,  customer: 'Sales Team',    address: 'Sales Office, Pune',             priority: 'high',   notes: 'For client demo',            status: 'pending',    date: '2026-06-03', statusHistory: ['pending'] }
  ],
  notifications: [
    { id: 'n1', title: 'Low Stock Alert',  text: 'Industrial Drill Set has only 6 units left.',     time: '2 hrs ago',  read: false, type: 'warning' },
    { id: 'n2', title: 'New Order Created',text: 'ORD-005 placed by Sales Team.',                   time: '1 hr ago',   read: false, type: 'info'    },
    { id: 'n3', title: 'Order Shipped',    text: 'ORD-002 has been shipped by QuickMart.',          time: '30 min ago', read: false, type: 'success' }
  ]
};

function post(hostname, path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request({ hostname, path, method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } }, res => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => resolve(JSON.parse(raw)));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function run() {
  console.log('Signing in as admin...');
  const signIn = await post('identitytoolkit.googleapis.com',
    `/v1/accounts:signInWithPassword?key=${API_KEY}`,
    { email: ADMIN_EMAIL, password: ADMIN_PASS, returnSecureToken: true }
  );

  if (signIn.error) {
    console.error('Login failed:', signIn.error.message);
    console.log('\nMake sure you have created admin@mis.app in Firebase Authentication first.');
    process.exit(1);
  }

  const idToken = signIn.idToken;
  console.log('Signed in. Writing data to Firestore...');

  const firestoreData = {
    fields: {
      data: { stringValue: JSON.stringify(defaultState) }
    }
  };

  await new Promise((resolve, reject) => {
    const body = JSON.stringify(firestoreData);
    const path = `/v1/projects/${PROJECT_ID}/databases/(default)/documents/mis/state`;
    const req = https.request({
      hostname: 'firestore.googleapis.com',
      path,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'Authorization': `Bearer ${idToken}`
      }
    }, res => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => {
        const result = JSON.parse(raw);
        if (result.error) { console.error('Firestore error:', result.error.message); reject(result.error); }
        else { resolve(result); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });

  console.log('\nDatabase seeded successfully!');
  console.log('Open http://localhost:3000 and log in with admin / Admin@123');
}

run().catch(console.error);
