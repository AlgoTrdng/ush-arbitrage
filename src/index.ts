import { executeUshTransaction } from './ush/transactions.js'

await executeUshTransaction({
  amountRaw: 10_000_000,
  type: 'redeem',
})
