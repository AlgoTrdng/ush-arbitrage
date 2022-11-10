import { Connection, Keypair } from '@solana/web3.js'

import { SOL_PRIVATE_KEY } from './env.js'

const pk = new Uint8Array(SOL_PRIVATE_KEY.split(',').map((x) => Number(x)))
export const solWallet = Keypair.fromSecretKey(pk)

export const connection = new Connection('https://rpc.ankr.com/solana', 'confirmed')
