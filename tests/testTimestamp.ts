import { getCurrentTimestamp } from '../lib/functions/getCurrentTimestamp.js'

console.log('ET:', getCurrentTimestamp())
console.log('UTC:', getCurrentTimestamp('UTC'))
console.log('London:', getCurrentTimestamp('Europe/London'))