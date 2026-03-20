import { error } from '@functions';
import { Client, Identity } from '@models';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const getLichessToken = async (code, verifier) => {
  const res = await fetch('https://lichess.org/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      redirect_uri: process.env.LICHESS_REDIRECT_URI,
      client_id: process.env.LICHESS_CLIENT_ID,
      code,
      code_verifier: verifier,
    }),
  });
  return res.json();
};

const getLichessUser = async (accessToken) => {
  const res = await fetch('https://lichess.org/api/account', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.json();
};

const getLichessEmail = async (accessToken) => {
  const res = await fetch('https://lichess.org/api/account/email', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json();
  return data.email || null;
};

export default async (req, res) => {
  const { code } = req.query;
  const verifier = req.signedCookies['_lichess_pkce'];
  res.clearCookie('_lichess_pkce');

  if (!code || !verifier) {
    throw error(400, 'Missing OAuth params');
  }

  const lichessToken = await getLichessToken(code, verifier);
  if (!lichessToken.access_token) {
    throw error(400, 'Could not obtain Lichess access token');
  }

  const [lichessUser, lichessEmail] = await Promise.all([
    getLichessUser(lichessToken.access_token),
    getLichessEmail(lichessToken.access_token),
  ]);

  const { id: lichessId, username } = lichessUser;
  const email = lichessEmail || `${lichessId}@lichess.local`;

  // 1. Returning Lichess user
  let identity = await Identity.findOne({ lichessId });

  // 2. Existing account with the same email — link it
  if (!identity && lichessEmail) {
    identity = await Identity.findOne({ email });
    if (identity) {
      await identity.updateOne({ lichessId });
    }
  }

  // 3. Brand new user — create a client account
  if (!identity) {
    const password = crypto.randomBytes(32).toString('hex');
    identity = await Client.create({ lichessId, name: username, email, password });
  }

  const { id, name, __t: role, image } = identity;
  const payload = { name, email: identity.email, role, me: id, image };

  const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '12h',
    algorithm: 'HS256',
  });

  const oneDay = 24 * 3600 * 1000;
  res.cookie(process.env.JWT_TOKEN_NAME, refreshToken, {
    domain: process.env.COOKIE_DOMAIN,
    httpOnly: true,
    maxAge: oneDay,
    secure: true,
    signed: true,
    sameSite: 'Lax',
  });

  await identity.updateOne({ lastLoginAt: Date.now() });

  return res.redirect(`${process.env.APP_BASE_URL}/${role || 'client'}`);
};
