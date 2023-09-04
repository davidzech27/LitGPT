import env from "~/env.mjs"

const qdrant = ({ collection }: { collection: string }) => ({
	createCollection: async () => {
		await fetch(`${env.QDRANT_URL}/collections/${collection}`, {
			method: "PUT",
			body: JSON.stringify({
				name: collection,
				vectors: {
					size: 1536,
					distance: "Dot",
				},
			}),
			headers: {
				"Content-Type": "application/json",
				"api-key": env.QDRANT_API_KEY,
			},
		})
	},
	insertPoints: async (
		points: {
			id: number
			payload: Record<string, string | number>
			vector: number[]
		}[],
	) => {
		await (
			await fetch(`${env.QDRANT_URL}/collections/${collection}/points`, {
				method: "PUT",
				body: JSON.stringify({ points }),
				headers: {
					"Content-Type": "application/json",
					"api-key": env.QDRANT_API_KEY,
				},
			})
		).json()
	},
	searchPoints: async ({
		vector,
		limit,
		filter,
	}: {
		vector: number[]
		limit: number
		filter?: Record<string, string | number>
	}) => {
		return (
			(await (
				await fetch(
					`${env.QDRANT_URL}/collections/${collection}/points/search`,
					{
						method: "POST",
						body: JSON.stringify({
							vector,
							limit,
							filter:
								filter !== undefined
									? {
											must: Object.keys(filter).map(
												(key) => ({
													key,
													match: {
														value: filter[key],
													},
												}),
											),
									  }
									: undefined,
							with_payload: true,
						}),
						headers: {
							"Content-Type": "application/json",
							"api-key": env.QDRANT_API_KEY,
						},
					},
				)
			).json()) as {
				result: {
					id: number
					score: number
					payload: Record<string, string | number>
				}[]
			}
		).result
	},
	countPoints: async () => {
		return (
			(await (
				await fetch(
					`${env.QDRANT_URL}/collections/${collection}/points/count`,
					{
						method: "POST",
						body: JSON.stringify({
							exact: true,
						}),
						headers: {
							"Content-Type": "application/json",
							"api-key": env.QDRANT_API_KEY,
						},
					},
				)
			).json()) as { result: { count: number } }
		).result.count
	},
})

export default qdrant
