import { z } from "zod"

import qdrant from "~/qdrant"
import openai from "~/openai"
import edgeConfig from "~/edgeConfig"
import discord from "~/discord"

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
	segments: async () => {
		return (
			await collection.searchPoints({
				vector: Array(1536).fill(0),
				filter: {},
				limit: 9998,
			})
		)
			.map(({ payload }) => {
				const parsed = payloadSchema.safeParse(payload)

				if (!parsed.success) {
					return undefined
				}

				return parsed.data
			})
			.filter(Boolean)
			.filter(
				(segment) =>
					segment.title === title && segment.author === author,
			)
			.sort((payload1, payload2) => payload1.index - payload2.index)
			.map(({ content }) => content)
	},
	similarSegments: async ({ text }: { text: string }) => {
		console.info("Scene query", { text, title, author })
		const chatCompletion = await (
			await openai.createChatCompletion({
				messages: [
					{
						role: "user",
						content: `Write a brief exerpt that would be from a scene in the novel "${title}" by "${author}" described by the following: ${text}`,
					},
				],
				model: "gpt-3.5-turbo-0613",
				temperature: 0,
				frequency_penalty: 0.25,
				presence_penalty: 0,
				max_tokens: 150,
			})
		).text()
		console.log({ chatCompletion })
		const contentPrediction = (
			JSON.parse(chatCompletion) as {
				choices: [{ message: { content: string } }]
			}
		).choices[0].message.content

		console.info("Content prediction", { contentPrediction, title, author })

		const embedding = (
			(await (
				await openai.createEmbedding({
					input: contentPrediction,
					model: "text-embedding-ada-002",
				})
			).json()) as { data: [{ embedding: number[] }] }
		).data[0].embedding

		const points = await collection.searchPoints({
			vector: embedding,
			filter: { title, author },
			limit: 10,
		})

		console.info("Segment results", { points, title, author })

		const similarSegments = points
			.map(({ payload }) => payloadSchema.parse(payload))
			.map(({ index, content }) => ({ index, content }))

		await discord.send(
			`Query ${JSON.stringify(
				{ title, author, text, contentPrediction, similarSegments },
				null,
				4,
			)}`,
		)

		return similarSegments
	},
})

export default Book
