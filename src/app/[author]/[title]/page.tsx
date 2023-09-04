import { type Metadata } from "next"

import SearchForm from "./SearchForm"

export const runtime = "edge"

interface Params {
	title: string
	author: string
}

export const generateMetadata = ({ params }: { params: Params }): Metadata => {
	const title = decodeURIComponent(params.title)
	const author = decodeURIComponent(params.author)

	return {
		title: `${title} by ${author}`,
	}
}

export default function BookPage({ params }: { params: Params }) {
	const title = decodeURIComponent(params.title)
	const author = decodeURIComponent(params.author)

	return (
		<main className="flex h-screen items-center justify-center">
			<SearchForm title={title} author={author} />
		</main>
	)
}
