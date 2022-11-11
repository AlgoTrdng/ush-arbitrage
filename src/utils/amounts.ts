import { Token } from '../constants';

const decimals: Record<Token, number> = {
  USDC: 6,
  USH: 9,
}

export const toUi = (amount: number, token: Token) => Math.floor(amount) / 10 ** decimals[token]

export const toRaw = (amount: number, token: Token) => Math.floor(amount * 10 ** decimals[token])
