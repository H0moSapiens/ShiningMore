import sql from '../../../lib/db';
import { getUserFromRequest } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { category } = req.query;
      let products;
      if (category && category !== 'All') {
        products = await sql`SELECT * FROM products WHERE category = ${category} ORDER BY created_at DESC`;
      } else {
        products = await sql`SELECT * FROM products ORDER BY created_at DESC`;
      }
      return res.status(200).json({ products });
    } catch (err) {
      return res.status(500).json({ message: 'Server error' });
    }
  }

  if (req.method === 'POST') {
    const user = getUserFromRequest(req, res);
    if (!user || user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });

    const { name, brand, description, price, stock, image_url, category, size_ml } = req.body;
    if (!name || !price) return res.status(400).json({ message: 'Name and price required' });

    try {
      const result = await sql`
        INSERT INTO products (name, brand, description, price, stock, image_url, category, size_ml)
        VALUES (${name}, ${brand}, ${description}, ${price}, ${stock || 0}, ${image_url}, ${category}, ${size_ml})
        RETURNING *
      `;
      return res.status(201).json({ product: result[0] });
    } catch (err) {
      return res.status(500).json({ message: 'Server error' });
    }
  }

  return res.status(405).end();
}
