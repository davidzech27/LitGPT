import { get, getAll, has } from "@vercel/edge-config"
import { z } from "zod"

const edgeConfigSchema = z.object({
	books: z
		.object({
			id: z.number(),
			title: z.string(),
			author: z.string(),

		})
		.array(),
})

type EdgeConfig = z.infer<typeof edgeConfigSchema>

const edgeConfig = {
	get: async <TKey extends keyof EdgeConfig>(key: TKey) => {
		return edgeConfigSchema.shape[key].parse(await get(key))
	},
	getAll: async () => {
		return edgeConfigSchema.parse(await getAll())
	},
	has,
}

export default edgeConfig
