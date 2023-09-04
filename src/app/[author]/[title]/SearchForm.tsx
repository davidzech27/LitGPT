"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface Props {
	title: string
	author: string
}

export default function SearchForm({ title, author }: Props) {
	const [input, setInput] = useState("")

	const [loading, setLoading] = useState(false)

	const router = useRouter()

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault()

				router.push(
					`/${encodeURIComponent(author)}/${encodeURIComponent(
						title,
					)}/${encodeURIComponent(input)}`,
				)

				setLoading(true)
			}}
			className="relative"
		>
			<input
				type="text"
				value={input}
				onChange={(e) => setInput(e.target.value)}
				autoFocus
				placeholder="a scene"
				className="w-52 w-full rounded-md border bg-gray-100 px-3 py-1.5 font-medium outline-none transition duration-200 ease-out placeholder:font-light placeholder:text-black/20 hover:bg-gray-200 focus:bg-gray-200"
			/>

			{loading && (
				<div className="absolute left-0 right-0 top-[46px] h-[38px] animate-pulse shadow-lg" />
			)}
		</form>
	)
}
