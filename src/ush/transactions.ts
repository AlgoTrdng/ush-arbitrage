import { AccountMeta, ConfirmedTransactionMeta, PublicKey, SystemProgram, Transaction, TransactionInstruction } from '@solana/web3.js'
import { getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { setTimeout } from 'node:timers/promises'

import { ArbitrageType, Mints } from '../constants.js'
import { connection, solWallet } from '../solana.js'
import { forceFetch } from '../utils/forceFetch.js'
import { sendAndConfirmTransaction, TransactionError } from '../utils/sendAndConfirmTransaction.js'
import { buildInstructionArguments } from './layouts.js'

const USH_PROGRAM_ID = new PublicKey('HedgeEohwU6RqokrvPU4Hb6XKPub8NuKbnPmY7FoMMtN')
const VAULT_SYSTEM_STATE = new PublicKey('57dko82JWxJxPkHvZAYtkAeCKQVrxBS1kgqPahuwFNzc')
const FEE_POOL = new PublicKey('CGRRN12pCXNTZToaJCqq11NeFbH4YKixqCNhXRXnFpi8')
const FEE_POOL_ATA_USH = new PublicKey('FD1JTui5tU9XKvPHveuPsb8CnvsZqaxeu8QJ8LS7oV4a')
const PSM_ACCOUNT = new PublicKey('Bizd3Pmkvp9C792ZNDn6ogpExqatUUHEzcvu2Q6JHDfb')
const PSM_ACCOUNT_ATA = new PublicKey('5Gs3r5gx6jm7f54f1D2YePv44CZnUAyz7h5tA9jbZCPN')
const REFERRAL_STATE = new PublicKey('6ENsq1nuZKuDv6qus91W4vzC37cEFEe1Xp1cgvMeQnDb')
const REFERRAL_ACCOUNT = new PublicKey('2iotFL6gxQmkjNaymEFamhQz1gnzSyZq6n1LKVVgNEKc')

const ushAccount = getAssociatedTokenAddressSync(Mints.USH, solWallet.publicKey)
const collateralAccount = getAssociatedTokenAddressSync(Mints.USDC, solWallet.publicKey)

const PSM_KEYS: AccountMeta[] = [
  { pubkey: solWallet.publicKey, isWritable: true, isSigner: true },
  { pubkey: VAULT_SYSTEM_STATE, isWritable: true, isSigner: false },
  { pubkey: FEE_POOL, isWritable: true, isSigner: false },
  { pubkey: FEE_POOL_ATA_USH, isWritable: true, isSigner: false },
  { pubkey: PSM_ACCOUNT, isWritable: true, isSigner: false },
  { pubkey: PSM_ACCOUNT_ATA, isWritable: true, isSigner: false },
  { pubkey: ushAccount, isWritable: true, isSigner: false },
  { pubkey: collateralAccount, isWritable: true, isSigner: false },
  { pubkey: Mints.USDC, isWritable: false, isSigner: false },
  { pubkey: Mints.USH, isWritable: true, isSigner: false },
  { pubkey: REFERRAL_STATE, isWritable: true, isSigner: false },
  { pubkey: REFERRAL_ACCOUNT, isWritable: true, isSigner: false },
  { pubkey: SystemProgram.programId, isWritable: false, isSigner: false },
  { pubkey: TOKEN_PROGRAM_ID, isWritable: false, isSigner: false },
]

type TxParams = {
  amountRaw: number
  type: ArbitrageType
}

export function executeUshTransaction({ amountRaw, type }: TxParams): Promise<ConfirmedTransactionMeta | null>
export function executeUshTransaction({
  amountRaw,
  type,
  repeatUntilDone,
}: TxParams & { repeatUntilDone: true }): Promise<ConfirmedTransactionMeta>
export async function executeUshTransaction({
  amountRaw,
  type,
  repeatUntilDone,
}: TxParams & { repeatUntilDone?: boolean }) {
  const latestBlockHash = await forceFetch(() => connection.getLatestBlockhash())
  const tx = new Transaction(latestBlockHash)

  const txData = buildInstructionArguments(amountRaw, type)
  tx.add(
    new TransactionInstruction({
      data: txData,
      keys: PSM_KEYS,
      programId: USH_PROGRAM_ID,
    }),
  )

  tx.sign(solWallet)

  while (true) {
    let res = await sendAndConfirmTransaction(tx)
    if (res.success) {
      return res.data
    }
    await setTimeout(500)
    if (res.err === TransactionError.BLOCK_HEIGHT_EXCEEDED) {
      if (repeatUntilDone) {
        return executeUshTransaction({ amountRaw, type, repeatUntilDone })
      }
      return null
    }
  }
}
