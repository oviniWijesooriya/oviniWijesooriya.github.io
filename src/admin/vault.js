// Admin login without a server. The GitHub token is encrypted with a key derived from the admin password
// (PBKDF2 + AES-GCM) and kept in this browser only. Without the password the stored data is unreadable.
import { base64ToBytes, bytesToBase64 } from './files.js'

const VAULT = 'ovini-admin-vault'
const SESSION = 'ovini-admin'
const ITERATIONS = 600000
export const MIN_PASSWORD = 10

const read = (storage, key) => {
  try {
    return JSON.parse(storage.getItem(key))
  } catch {
    return null
  }
}

async function deriveKey(password, salt, usage) {
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey'])
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' }, material, { name: 'AES-GCM', length: 256 }, false, [usage])
}

export const hasAccount = () => Boolean(read(localStorage, VAULT))

export async function createAccount(username, password, credentials) {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await deriveKey(password, salt, 'encrypt')
  const data = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(JSON.stringify(credentials)))
  localStorage.setItem(VAULT, JSON.stringify({ username: username.trim().toLowerCase(), salt: bytesToBase64(salt), iv: bytesToBase64(iv), data: bytesToBase64(new Uint8Array(data)) }))
}

/** Returns the stored credentials, or throws the same error for a wrong name or password. */
export async function unlock(username, password) {
  const wrong = new Error('Username or password is wrong.')
  const vault = read(localStorage, VAULT)
  if (!vault || vault.username !== username.trim().toLowerCase()) throw wrong
  try {
    const key = await deriveKey(password, base64ToBytes(vault.salt), 'decrypt')
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: base64ToBytes(vault.iv) }, key, base64ToBytes(vault.data))
    return JSON.parse(new TextDecoder().decode(plain))
  } catch {
    throw wrong
  }
}

export const removeAccount = () => localStorage.removeItem(VAULT)

// The unlocked session lasts until the tab closes or the owner signs out.
export const startSession = (credentials, username) => sessionStorage.setItem(SESSION, JSON.stringify({ ...credentials, username }))
export const readSession = () => read(sessionStorage, SESSION)
export const endSession = () => sessionStorage.removeItem(SESSION)
