import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

const env = createEnv({
	server: {
		NODE_ENV: z.enum(["development", "test", "production"]),
		OPENAI_SECRET_KEY: z.string(),
		QDRANT_URL: z.string().url(),
		QDRANT_API_KEY: z.string(),
		DISCORD_WEBHOOK_URL: z.string().url(),
		EDGE_CONFIG: z.string().url(),
	},
	client: {
		NEXT_PUBLIC_CONTACT_EMAIL: z.string().email(),
	},
	runtimeEnv: {
		NODE_ENV: process.env.NODE_ENV,
		OPENAI_SECRET_KEY: process.env.OPENAI_SECRET_KEY,
		QDRANT_URL: process.env.QDRANT_URL,
		QDRANT_API_KEY: process.env.QDRANT_API_KEY,
		EDGE_CONFIG: process.env.EDGE_CONFIG,
		DISCORD_WEBHOOK_URL: process.env.DISCORD_WEBHOOK_URL,
		NEXT_PUBLIC_CONTACT_EMAIL: process.env.NEXT_PUBLIC_CONTACT_EMAIL,
	},
})

export default env
