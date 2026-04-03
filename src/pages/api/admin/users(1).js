import sql from '../../../lib/db';
import { getUserFromRequest } from '../../../lib/auth';

export default async function handler(req, res) {
  const user = getUserFromRequest(req, res);
  if (!user || user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });

  if (req.method === 'GET') {
    try {
      const users = await sql`SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC`;
      return res.status(200).json({ users });
    } catch (err) {
      return res.status(500).json({ message: 'Server error' });
    }
  }

  if (req.method === 'PATCH') {
    const { userId, role } = req.body;
    if (!userId || !role) return res.status(400).json({ message: 'userId and role required' });

    try {
      await sql`UPDATE users SET role = ${role} WHERE id = ${userId}`;
      return res.status(200).json({ message: 'User updated' });
    } catch (err) {
      return res.status(500).json({ message: 'Server error' });
    }
  }

  return res.status(405).end();
}
