import crypto from 'crypto';

const base64URLEncode = (buf) =>
  buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

const createVerifier = () => base64URLEncode(crypto.randomBytes(32));

const createChallenge = (verifier) =>
  base64URLEncode(crypto.createHash('sha256').update(verifier).digest());

export default async (req, res) => {
  const verifier = createVerifier();
  const challenge = createChallenge(verifier);

  res.cookie('_lichess_pkce', verifier, {
    httpOnly: true,
    maxAge: 5 * 60 * 1000,
    signed: true,
    sameSite: 'Lax',
    secure: process.env.NODE_ENV === 'production',
  });

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.LICHESS_CLIENT_ID,
    redirect_uri: process.env.LICHESS_REDIRECT_URI,
    scope: 'email:read',
    code_challenge_method: 'S256',
    code_challenge: challenge,
  });

  return res.redirect(`https://lichess.org/oauth?${params}`);
};
