import { z } from "zod"

import qdrant from "~/qdrant"
import openai from "~/openai"

const collection = qdrant({ collection: "litgpt" })

const payloadSchema = z.object({
	title: z.string(),
	index: z.number(),
	content: z.string(),
})

type Payload = z.infer<typeof payloadSchema>

const Book = ({ title }: { title: string }) => ({
	addSegment: async ({
		index,
		content,
	}: {
		index: number
		content: string
	}) => {
		const id = Number(
			title
				.split("")
				.map((char) => char.charCodeAt(0) % 10)
				.filter((_, index) => index % 2 === 0)
				.concat(index)
				.join(""),
		)

		const embedding = (
			(await (
				await openai.createEmbedding({
					input: content,
					model: "text-embedding-ada-002",
				})
			).json()) as { data: [{ embedding: number[] }] }
		).data[0].embedding

		await collection.insertPoints([
			{
				id,
				payload: { title, index, content } satisfies Payload,
				vector: embedding,
			},
		])
	},
	similarSegments: async ({ text }: { text: string }) => {
		const contentPrediction = (
			(await (
				await openai.createChatCompletion({
					messages: [
						{
							role: "user",
							content: `Write a brief exerpt from a scene from a novel "${title}" relating to the following: ${text}`,
						},
					],
					model: "gpt-3.5-turbo",
					temperature: 0,
					frequency_penalty: 0.25,
					presence_penalty: 0,
					max_tokens: 300,
				})
			).json()) as { choices: [{ message: { content: string } }] }
		).choices[0].message.content
		console.log({ contentPrediction })
		const embedding = (
			(await (
				await openai.createEmbedding({
					input: contentPrediction,
					model: "text-embedding-ada-002",
				})
			).json()) as { data: [{ embedding: number[] }] }
		).data[0].embedding

		const points = await collection.searchPoints({
			embedding,
			filter: { title },
			limit: 10,
		})

		return points
			.map(({ payload }) => payloadSchema.parse(payload))
			.map(({ index, content }) => ({ index, content }))
	},
})

export default Book
