import { type Metadata } from "next"

import Book from "~/data/Book"

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

	const segments = await Book({ title, author }).similarSegments({ text })

	return (
		<main className="space-y-2.5 px-52 py-6 mobile:px-6">
			{segments.map(({ index, content }) => (
				<div
					key={index}
					className="cursor-pointer whitespace-pre rounded-md border bg-gray-100 px-6 py-3 outline-none transition duration-150 hover:bg-gray-200 focus-visible:bg-gray-200 active:bg-gray-200"
				>
					{content}
				</div>
			))}
		</main>
	)
}
