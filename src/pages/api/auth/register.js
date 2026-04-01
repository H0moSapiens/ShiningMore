import sql from '../../../lib/db';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });
  if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });

  try {
    const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existing.length > 0) return res.status(409).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    await sql`INSERT INTO users (name, email, password, role) VALUES (${name}, ${email}, ${hashed}, 'pending')`;

    return res.status(201).json({ message: 'Registration successful. Awaiting admin approval.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}
