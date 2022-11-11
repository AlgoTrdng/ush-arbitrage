import { PublicKey } from '@solana/web3.js'

export const ANCHOR_ACCOUNT_DISCRIMINATOR = 8

export type ArbitrageType = 'mint' | 'redeem'

export type Token = 'USDC' | 'USH'
export const Mints: Record<Token, PublicKey> = {
	USDC: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
	USH: new PublicKey('9iLH8T7zoWhY7sBmj1WK9ENbWdS1nL8n9wAxaeRitTa6'),
}
