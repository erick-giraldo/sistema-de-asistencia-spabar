// CommonJS para que lo usen tanto las rutas de Next como supabase/set-password.js.
const { randomBytes, scrypt, timingSafeEqual } = require('crypto')

const N = 32768
const R = 8
const P = 1
const KEY_LENGTH = 64
const MAX_MEMORY = 64 * 1024 * 1024

function deriveKey(password, salt, n, r, p, keyLength) {
    return new Promise((resolve, reject) => {
        scrypt(password, salt, keyLength, { N: n, r, p, maxmem: MAX_MEMORY }, (error, key) => {
            if (error) reject(error)
            else resolve(key)
        })
    })
}

/** @param {string} password @returns {Promise<string>} */
async function hashPassword(password) {
    const salt = randomBytes(16)
    const key = await deriveKey(password, salt, N, R, P, KEY_LENGTH)
    return ['scrypt', N, R, P, salt.toString('base64url'), key.toString('base64url')].join('$')
}

/** @param {string} value @returns {boolean} */
function isPasswordHash(value) {
    return typeof value === 'string' && value.startsWith('scrypt$')
}

/**
 * Los valores que no son un hash (contraseñas antiguas en texto plano) nunca coinciden.
 * @param {string} password @param {string} stored @returns {Promise<boolean>}
 */
async function verifyPassword(password, stored) {
    if (!isPasswordHash(stored)) return false

    const [, n, r, p, salt, expected] = stored.split('$')
    if (!salt || !expected) return false

    const expectedKey = Buffer.from(expected, 'base64url')
    if (expectedKey.length === 0) return false

    const key = await deriveKey(
        password,
        Buffer.from(salt, 'base64url'),
        Number(n),
        Number(r),
        Number(p),
        expectedKey.length
    )
    return timingSafeEqual(key, expectedKey)
}

module.exports = { hashPassword, isPasswordHash, verifyPassword }
