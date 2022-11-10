import { PublicKey } from '@solana/web3.js'

export const ANCHOR_ACCOUNT_DISCRIMINATOR = 8

export type ArbitrageType = 'mint' | 'redeem'

export const Mints = {
	USDC: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
	USH: new PublicKey('9iLH8T7zoWhY7sBmj1WK9ENbWdS1nL8n9wAxaeRitTa6'),
}

export type Token = keyof typeof Mints
