import { getUserFromRequest } from '../../../lib/auth';

export default function handler(req, res) {
  const user = getUserFromRequest(req, res);
  if (!user) return res.status(401).json({ message: 'Not authenticated' });
  return res.status(200).json({ user });
}
