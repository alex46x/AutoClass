const encoder = new TextEncoder();
const decoder = new TextDecoder();

function getSecretKey() {
  const secretKey = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'development_only_jwt_secret_change_me');

  if (!secretKey) {
    throw new Error('JWT_SECRET must be set in production.');
  }

  return secretKey;
}

function base64UrlEncode(input: string | Uint8Array) {
  const bytes = typeof input === 'string' ? encoder.encode(input) : input;
  let binary = '';
  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }

  return btoa(binary)
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(input: string) {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

async function getSigningKey() {
  return await crypto.subtle.importKey(
    'raw',
    encoder.encode(getSecretKey()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export async function signToken(payload: any) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64UrlEncode(JSON.stringify({
    ...payload,
    iat: issuedAt,
    exp: issuedAt + 60 * 60 * 24,
  }));
  const data = `${header}.${body}`;
  const signature = await crypto.subtle.sign('HMAC', await getSigningKey(), encoder.encode(data));

  return `${data}.${base64UrlEncode(new Uint8Array(signature))}`;
}

export async function verifyToken(token: string) {
  try {
    const [header, body, signature] = token.split('.');
    if (!header || !body || !signature) return null;

    const parsedHeader = JSON.parse(decoder.decode(base64UrlDecode(header)));
    if (parsedHeader.alg !== 'HS256') return null;

    const data = `${header}.${body}`;
    const isValid = await crypto.subtle.verify(
      'HMAC',
      await getSigningKey(),
      base64UrlDecode(signature),
      encoder.encode(data)
    );
    if (!isValid) return null;

    const payload = JSON.parse(decoder.decode(base64UrlDecode(body)));
    if (typeof payload.exp === 'number' && payload.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
