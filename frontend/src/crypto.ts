import * as crypto from 'node:crypto'

export const randomId = () => {
    crypto.randomBytes(8).toString('hex')
} 