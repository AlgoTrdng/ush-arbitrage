import { PublicKey, Commitment, ConfirmOptions, Signer } from '@solana/web3.js'

declare module '@solana/spl-token' {
	export function getAssociatedTokenAddressSync(
		mint: PublicKey,
		owner: PublicKey,
		allowOwnerOffCurve?: boolean,
		programId?: PublicKey,
		associatedTokenProgramId?: PublicKey,
	): PublicKey

	export function createAssociatedTokenAccountInstruction(
		payer: PublicKey,
		associatedToken: PublicKey,
		owner: PublicKey,
		mint: PublicKey,
		programId?: PublicKey,
		associatedTokenProgramId?: PublicKey,
	): TransactionInstruction

	export function createSyncNativeInstruction(
		account: PublicKey,
		programId?: PublicKey,
	): TransactionInstruction

	export interface Account {
		address: PublicKey
		mint: PublicKey
		owner: PublicKey
		amount: bigint
		delegate: PublicKey | null
		delegatedAmount: bigint
		isInitialized: boolean
		isFrozen: boolean
		isNative: boolean
		rentExemptReserve: bigint | null
		closeAuthority: PublicKey | null
		tlvData: Buffer
	}

	export function getOrCreateAssociatedTokenAccount(
		connection: Connection,
		payer: Signer,
		mint: PublicKey,
		owner: PublicKey,
		allowOwnerOffCurve?: boolean,
		commitment?: Commitment,
		confirmOptions?: ConfirmOptions,
		programId?: PublicKey,
		associatedTokenProgramId?: PublicKey,
	): Promise<Account>

	export function createTransferCheckedInstruction(
		source: PublicKey,
		mint: PublicKey,
		destination: PublicKey,
		owner: PublicKey,
		amount: number | bigint,
		decimals: number,
		multiSigners?: Signer[],
		programId?: PublicKey,
	): TransactionInstruction
}
