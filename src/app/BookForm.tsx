"use client"
import { useMemo, useState } from "react"
import Link from "next/link"
import Fuse from "fuse.js"
import { motion, AnimatePresence } from "framer-motion"

interface Props {
	books: { title: string; author: string }[]
}

export default function BookForm({ books }: Props) {
	const [input, setInput] = useState("")

	const [fuse] = useState(
		() =>
			new Fuse(books, {
				keys: [
					{ name: "title", weight: 1 },
					{ name: "author", weight: 0.5 },
				],
			}),
	)

	const bookResults = useMemo(
		() => fuse.search(input, { limit: 6 }).map((result) => result.item),
		[input, fuse],
	)

	return (
		<div className="relative w-52">
			<input
				type="text"
				value={input}
				onChange={(e) => setInput(e.target.value)}
				placeholder="a book"
				className="w-full rounded-md border bg-gray-100 px-3 py-1.5 font-medium outline-none transition duration-200 ease-out placeholder:font-light placeholder:text-black/20 hover:bg-gray-200 focus:bg-gray-200"
			/>

			<div className="absolute left-0 right-0">
				<div className="mt-1.5 space-y-1.5">
					<AnimatePresence>
						{bookResults.map((bookResult) => (
							<motion.div
								key={`${bookResult.title}:${bookResult.author}`}
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{
									duration: 0.2,
									ease: "easeOut",
								}}
								layout
							>
								<Link
									href={`/${encodeURIComponent(
										bookResult.author,
									)}/${encodeURIComponent(bookResult.title)}`}
									className="block rounded-md border bg-gray-100 px-3 py-1.5 outline-none transition duration-200 ease-out hover:bg-gray-200 focus-visible:bg-gray-200 active:bg-gray-200"
								>
									<div className="font-medium leading-tight">
										{bookResult.title}
									</div>

									<div className="mt-1 font-light leading-tight text-black/30">
										{bookResult.author}
									</div>
								</Link>
							</motion.div>
						))}
					</AnimatePresence>
				</div>
			</div>
		</div>
	)
}
