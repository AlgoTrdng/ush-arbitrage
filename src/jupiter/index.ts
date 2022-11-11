import { ConfirmedTransactionMeta, Transaction } from '@solana/web3.js'
import { Jupiter } from '@jup-ag/core'
import JSBI from 'jsbi'
import { setTimeout } from 'node:timers/promises'
import fetch from 'node-fetch'

import { ArbitrageType, Mints } from '../constants.js'
import { connection, solWallet } from '../solana.js'
import { toRaw, toUi } from '../utils/amounts.js'
import { sendAndConfirmTransaction, TransactionError } from '../utils/sendAndConfirmTransaction.js'

const jupiter = await Jupiter.load({
  connection,
  cluster: 'mainnet-beta',
  user: solWallet,
  ammsToExclude: {
    GooseFX: true,
  }
})

const tokens = {
  mint: {
    inputMint: Mints.USH,
    outputMint: Mints.USDC,
  },
  redeem: {
    inputMint: Mints.USDC,
    outputMint: Mints.USH,
  },
} as const

type APIRouteInfo = {
  inAmount: string
  outAmount: string
  priceImpactPct: number
  amount: string
  slippageBps: 5,
  otherAmountThreshold: string
  swapMode: string
}

type QuoteResponse = {
  data: APIRouteInfo[]
}

type JupiterTxParams = {
  amountRaw: number
  type: ArbitrageType
}

export const fetchOutAmount = async ({ amountRaw, type }: JupiterTxParams) => {
  const mints = tokens[type]
  const params = new URLSearchParams({
    inputMint: mints.inputMint.toString(),
    outputMint: mints.outputMint.toString(),
    amount: amountRaw.toString(),
    slippageBps: '5',
  })
  const res = await (await fetch(`https://quote-api.jup.ag/v3/quote?${params.toString()}`)).json() as QuoteResponse
  const [routeInfo] = res.data
  const outputAmount = toUi(Number(routeInfo.outAmount), type === 'redeem' ? 'USH' : 'USDC')
  return outputAmount
}

const fetchTransactions = async ({
  amountRaw,
  type,
}: JupiterTxParams) => {
  const { routesInfos } = await jupiter.computeRoutes({
    ...tokens[type],
    amount: JSBI.BigInt(amountRaw),
    slippageBps: 5,
  })
  const [routeInfo] = routesInfos
  const { transactions } = await jupiter.exchange({ routeInfo })
  return transactions  
}

export function executeJupiterTransaction({ amountRaw, type }: JupiterTxParams): Promise<ConfirmedTransactionMeta | null>
export function executeJupiterTransaction({
  amountRaw,
  type,
  repeatUntilDone,
}: JupiterTxParams & { repeatUntilDone: true }): Promise<ConfirmedTransactionMeta>
export async function executeJupiterTransaction({
  amountRaw,
  type,
  repeatUntilDone,
}: JupiterTxParams & { repeatUntilDone?: boolean }): Promise<ConfirmedTransactionMeta | null> {
  const transactions = await fetchTransactions({
    amountRaw,
    type,
  })

  Object.values(transactions).forEach((tx) => {
    if (tx) {
      tx.sign(solWallet)
    }
  })

  const execute = async (tx: Transaction) => {
    while (true) {
      const res = await sendAndConfirmTransaction(tx)
      if (res.success) {
        return res.data
      }
      await setTimeout(500)
      if (res.err === TransactionError.BLOCK_HEIGHT_EXCEEDED) {
        if (repeatUntilDone) {
          return () => executeJupiterTransaction({ amountRaw, type, repeatUntilDone })
        }
        return () => null
      }
    }
  }

  const {
    setupTransaction: setupTx,
    swapTransaction: swapTx,
    cleanupTransaction: cleanupTx,
  } = transactions
  
  if (setupTx) {
    const setupRes = await execute(setupTx)
    if (typeof setupRes === 'function')  {
      return setupRes()
    }
  }

  const swapRes = await execute(swapTx)

  if (cleanupTx) {
    const cleanupRes = await execute(cleanupTx)
    if (typeof cleanupRes === 'function') {
      return cleanupRes()
    }
  }

  if (typeof swapRes === 'function') {
    return swapRes()
  }

  return swapRes
}
