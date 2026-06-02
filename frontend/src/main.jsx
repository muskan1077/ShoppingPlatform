import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Boxes, ClipboardList, PackagePlus, UsersRound } from 'lucide-react';
import { api, getErrorMessage } from './api/client';
import './styles.css';

const emptyProduct = { name: '', sku: '', description: '', price: '', stock_quantity: '' };
const emptyCustomer = { name: '', email: '', phone: '', address: '' };

function Stat({ label, value }) {
  return (
    <div className="stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ProductPanel({ products, reload }) {
  const [form, setForm] = useState(emptyProduct);
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setError('');
    try {
      await api.post('/products', {
        ...form,
        price: Number(form.price),
        stock_quantity: Number(form.stock_quantity),
      });
      setForm(emptyProduct);
      await reload();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function remove(id) {
    setError('');
    try {
      await api.delete(`/products/${id}`);
      await reload();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <section className="workspace">
      <form className="panel form-grid" onSubmit={submit}>
        <h2>Add Product</h2>
        <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input placeholder="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required />
        <input placeholder="Price" type="number" min="0.01" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
        <input placeholder="Stock" type="number" min="0" value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })} required />
        <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        {error && <p className="error">{error}</p>}
        <button type="submit"><PackagePlus size={18} /> Save Product</button>
      </form>

      <div className="panel table-panel">
        <h2>Products</h2>
        <div className="table">
          <div className="row heading"><span>Name</span><span>SKU</span><span>Price</span><span>Stock</span><span></span></div>
          {products.map((product) => (
            <div className="row" key={product.id}>
              <span>{product.name}</span>
              <span>{product.sku}</span>
              <span>₹{Number(product.price).toFixed(2)}</span>
              <span className={product.stock_quantity < 5 ? 'low-stock' : ''}>{product.stock_quantity}</span>
              <button className="ghost" onClick={() => remove(product.id)}>Delete</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CustomerPanel({ customers, reload }) {
  const [form, setForm] = useState(emptyCustomer);
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setError('');
    try {
      await api.post('/customers', form);
      setForm(emptyCustomer);
      await reload();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <section className="workspace">
      <form className="panel form-grid" onSubmit={submit}>
        <h2>Add Customer</h2>
        <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <textarea placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        {error && <p className="error">{error}</p>}
        <button type="submit"><UsersRound size={18} /> Save Customer</button>
      </form>

      <div className="panel table-panel">
        <h2>Customers</h2>
        <div className="table customer-table">
          <div className="row heading"><span>Name</span><span>Email</span><span>Phone</span></div>
          {customers.map((customer) => (
            <div className="row" key={customer.id}>
              <span>{customer.name}</span>
              <span>{customer.email}</span>
              <span>{customer.phone || '-'}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function OrdersPanel({ products, customers, orders, reload }) {
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState([{ product_id: '', quantity: 1 }]);
  const [error, setError] = useState('');

  const total = items.reduce((sum, item) => {
    const product = products.find((entry) => entry.id === Number(item.product_id));
    return sum + (product ? Number(product.price) * Number(item.quantity || 0) : 0);
  }, 0);

  async function submit(event) {
    event.preventDefault();
    setError('');
    try {
      await api.post('/orders', {
        customer_id: Number(customerId),
        items: items.map((item) => ({ product_id: Number(item.product_id), quantity: Number(item.quantity) })),
      });
      setCustomerId('');
      setItems([{ product_id: '', quantity: 1 }]);
      await reload();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <section className="workspace">
      <form className="panel order-form" onSubmit={submit}>
        <h2>Create Order</h2>
        <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} required>
          <option value="">Select customer</option>
          {customers.map((customer) => <option value={customer.id} key={customer.id}>{customer.name}</option>)}
        </select>
        {items.map((item, index) => (
          <div className="order-line" key={index}>
            <select value={item.product_id} onChange={(e) => {
              const next = [...items];
              next[index].product_id = e.target.value;
              setItems(next);
            }} required>
              <option value="">Select product</option>
              {products.map((product) => (
                <option value={product.id} key={product.id}>{product.name} ({product.stock_quantity} in stock)</option>
              ))}
            </select>
            <input type="number" min="1" value={item.quantity} onChange={(e) => {
              const next = [...items];
              next[index].quantity = e.target.value;
              setItems(next);
            }} required />
          </div>
        ))}
        <div className="actions">
          <button type="button" className="secondary" onClick={() => setItems([...items, { product_id: '', quantity: 1 }])}>Add Item</button>
          <strong>Total: ₹{total.toFixed(2)}</strong>
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit"><ClipboardList size={18} /> Place Order</button>
      </form>

      <div className="panel table-panel">
        <h2>Recent Orders</h2>
        <div className="orders-list">
          {orders.map((order) => (
            <article className="order-card" key={order.id}>
              <div>
                <strong>Order #{order.id}</strong>
                <span>Customer ID: {order.customer_id}</span>
              </div>
              <strong>₹{Number(order.total_amount).toFixed(2)}</strong>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function App() {
  const [active, setActive] = useState('products');
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadError, setLoadError] = useState('');

  async function loadData() {
    setLoadError('');
    try {
      const [productRes, customerRes, orderRes] = await Promise.all([
        api.get('/products'),
        api.get('/customers'),
        api.get('/orders'),
      ]);
      setProducts(productRes.data);
      setCustomers(customerRes.data);
      setOrders(orderRes.data);
    } catch (err) {
      setLoadError(getErrorMessage(err));
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <main>
      <aside>
        <div className="brand"><Boxes size={24} /> Inventory Ops</div>
        <button className={active === 'products' ? 'active' : ''} onClick={() => setActive('products')}>Products</button>
        <button className={active === 'customers' ? 'active' : ''} onClick={() => setActive('customers')}>Customers</button>
        <button className={active === 'orders' ? 'active' : ''} onClick={() => setActive('orders')}>Orders</button>
      </aside>

      <div className="content">
        <header>
          <div>
            <p>Inventory & Order Management</p>
            <h1>Operations Console</h1>
          </div>
          <div className="stats">
            <Stat label="Products" value={products.length} />
            <Stat label="Customers" value={customers.length} />
            <Stat label="Orders" value={orders.length} />
          </div>
        </header>

        {loadError && <p className="error banner">{loadError}</p>}
        {active === 'products' && <ProductPanel products={products} reload={loadData} />}
        {active === 'customers' && <CustomerPanel customers={customers} reload={loadData} />}
        {active === 'orders' && <OrdersPanel products={products} customers={customers} orders={orders} reload={loadData} />}
      </div>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
