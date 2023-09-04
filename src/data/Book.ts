import { z } from "zod"

import qdrant from "~/qdrant"
import openai from "~/openai"
import edgeConfig from "~/edgeConfig"

const collection = qdrant({ collection: "litgpt" })

const payloadSchema = z.object({
	title: z.string(),
	author: z.string(),
	index: z.number(),
	content: z.string(),
})

type Payload = z.infer<typeof payloadSchema>

const Book = ({ title, author }: { title: string; author: string }) => ({
	addSegment: async ({
		index,
		content,
	}: {
		index: number
		content: string
	}) => {
		const books = await edgeConfig.get("books")

		const bookId = books.find(
			(book) => book.title === title && book.author === author,
		)?.id

		if (bookId === undefined)
			throw new Error(
				`${title} by ${author} not yet added to edge config`,
			)

		const id = Number(
			bookId.toString().padStart(6, "0").concat(index.toString()),
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
				payload: { title, author, index, content } satisfies Payload,
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
							content: `Write a brief exerpt from a scene from the novel "${title}" by "${author}" relating to the following: ${text}`,
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

		console.info("Content prediction:", contentPrediction)

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
			filter: { title, author },
			limit: 10,
		})

		return points
			.map(({ payload }) => payloadSchema.parse(payload))
			.map(({ index, content }) => ({ index, content }))
	},
})

export default Book
