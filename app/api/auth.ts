import type { NextApiRequest, NextApiResponse } from 'next';
import {sign } from 'jsonwebtoken';



export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { key } = req.body;

  if (key !== process.env.AUTH_SECRET) {
    return res.status(401).json({ message: 'Clé invalide' });
  }

  const token = sign({ access: true }, process.env.JWT_SECRET as string, {
    expiresIn: '1d',
  });

  res.setHeader('Set-Cookie', `auth=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`);
  return res.status(200).json({ success: true });
}