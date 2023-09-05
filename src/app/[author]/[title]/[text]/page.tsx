import { type Metadata } from "next"
import Link from "next/link"

import Book from "~/data/Book"
import Segments from "./Segments"
import discord from "~/discord"

export const runtime = "edge"

interface Params {
	title: string
	author: string
	text: string
}

export const generateMetadata = ({ params }: { params: Params }): Metadata => {
	const title = decodeURIComponent(params.title)
	const author = decodeURIComponent(params.author)

	return {
		title: `${title} by ${author}`,
	}
}

export default async function BookPage({ params }: { params: Params }) {
	const title = decodeURIComponent(params.title)
	const author = decodeURIComponent(params.author)
	const text = decodeURIComponent(params.text)

	const index = Number(text)

	if (isNaN(index)) {
		const [segments, similarSegments] = await Promise.all([
			Book({ title, author }).segments(),
			Book({ title, author }).similarSegments({
				text,
			}),
		])

		return (
			<main className="space-y-2.5 px-52 py-6 mobile:px-6">
				{similarSegments.map(({ index }) => (
					<Link
						key={index}
						href={`/${encodeURIComponent(
							author,
						)}/${encodeURIComponent(title)}/${index}`}
						draggable={false}
						className="block select-text rounded-md border bg-gray-50 px-6 py-3 opacity-60 outline-none transition duration-200 ease-out hover:opacity-100 focus-visible:opacity-100 active:opacity-100"
					>
						<Segments index={index} segments={segments} />
					</Link>
				))}
			</main>
		)
	} else {
		const [segments] = await Promise.all([
			Book({ title, author }).segments(),
			discord.send(
				`Segment query ${JSON.stringify(
					{ title, author, index },
					null,
					4,
				)}`,
			),
		])

		return (
			<main className="px-52 py-6 mobile:px-6">
				<Segments index={index} segments={segments} />
			</main>
		)
	}
}
