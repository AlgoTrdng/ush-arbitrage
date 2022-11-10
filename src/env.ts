import { config } from 'dotenv'
import { z } from 'zod'

config()

const envSchema = z.object({
  SOL_PRIVATE_KEY: z.string().min(1),
})
const result = envSchema.safeParse(process.env)

if (!result.success) {
  throw result.error
}

export const { SOL_PRIVATE_KEY } = result.data
