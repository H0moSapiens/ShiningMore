import sql from '../../../lib/db';
import bcrypt from 'bcryptjs';
import { signToken } from '../../../lib/auth';
import { setCookie } from 'cookies-next';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

  try {
    const users = await sql`SELECT * FROM users WHERE email = ${email}`;
    const user = users[0];

    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    if (user.role === 'pending') return res.status(403).json({ message: 'Account awaiting admin approval' });
    if (user.role === 'rejected') return res.status(403).json({ message: 'Account has been rejected' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken({ id: user.id, email: user.email, role: user.role, name: user.name });
    setCookie('auth_token', token, { req, res, maxAge: 60 * 60 * 24 * 7, httpOnly: true, path: '/' });

    return res.status(200).json({ message: 'Login successful', user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}
