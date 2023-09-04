import edgeConfig from "~/edgeConfig"
import BookForm from "./BookForm"

export const runtime = "edge"

export default async function Home() {
	const books = (await edgeConfig.get("books")).map(({ title, author }) => ({
		title,
		author,
	}))

	return (
		<main className="flex h-screen items-center justify-center">
			<BookForm books={books} />
		</main>
	)
}
