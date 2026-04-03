import sql from '../../../lib/db';
import { getUserFromRequest } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const user = getUserFromRequest(req, res);
  if (!user || user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });

  const { sheet } = req.query; // users | products | transactions

  try {
    let data = [];
    let columns = [];

    if (sheet === 'users' || !sheet) {
      data = await sql`
        SELECT id, name, email, role,
               TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at
        FROM users ORDER BY id
      `;
      columns = ['id', 'name', 'email', 'role', 'created_at'];
    } else if (sheet === 'products') {
      data = await sql`
        SELECT id, name, brand, category, price, stock, size_ml, description,
               TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at
        FROM products ORDER BY id
      `;
      columns = ['id', 'name', 'brand', 'category', 'price', 'stock', 'size_ml', 'description', 'created_at'];
    } else if (sheet === 'transactions') {
      data = await sql`
        SELECT t.id, u.name as customer_name, u.email as customer_email,
               t.total_amount, t.status,
               TO_CHAR(t.created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at
        FROM transactions t
        JOIN users u ON t.user_id = u.id
        ORDER BY t.id
      `;
      columns = ['id', 'customer_name', 'customer_email', 'total_amount', 'status', 'created_at'];
    } else if (sheet === 'transaction_items') {
      data = await sql`
        SELECT ti.id, ti.transaction_id, p.name as product_name, p.brand,
               ti.quantity, ti.price_at_purchase,
               (ti.quantity * ti.price_at_purchase) as subtotal
        FROM transaction_items ti
        JOIN products p ON ti.product_id = p.id
        ORDER BY ti.transaction_id, ti.id
      `;
      columns = ['id', 'transaction_id', 'product_name', 'brand', 'quantity', 'price_at_purchase', 'subtotal'];
    }

    return res.status(200).json({ data, columns });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}
