import sql from '../../../lib/db';
import { getUserFromRequest } from '../../../lib/auth';

export default async function handler(req, res) {
  const user = getUserFromRequest(req, res);
  if (!user) return res.status(401).json({ message: 'Not authenticated' });

  if (req.method === 'POST') {
    const { items } = req.body; // items: [{ product_id, quantity, price }]
    if (!items || items.length === 0) return res.status(400).json({ message: 'No items' });

    try {
      const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

      const txResult = await sql`
        INSERT INTO transactions (user_id, total_amount, status)
        VALUES (${user.id}, ${total}, 'paid')
        RETURNING id
      `;
      const txId = txResult[0].id;

      for (const item of items) {
        await sql`
          INSERT INTO transaction_items (transaction_id, product_id, quantity, price_at_purchase)
          VALUES (${txId}, ${item.product_id}, ${item.quantity}, ${item.price})
        `;
        await sql`UPDATE products SET stock = stock - ${item.quantity} WHERE id = ${item.product_id}`;
      }

      return res.status(201).json({ message: 'Transaction complete', transaction_id: txId });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  if (req.method === 'GET') {
    try {
      let transactions;
      if (user.role === 'admin') {
        transactions = await sql`
          SELECT t.*, u.name as user_name, u.email as user_email
          FROM transactions t
          JOIN users u ON t.user_id = u.id
          ORDER BY t.created_at DESC
        `;
      } else {
        transactions = await sql`
          SELECT t.* FROM transactions t
          WHERE t.user_id = ${user.id}
          ORDER BY t.created_at DESC
        `;
      }
      return res.status(200).json({ transactions });
    } catch (err) {
      return res.status(500).json({ message: 'Server error' });
    }
  }

  return res.status(405).end();
}
