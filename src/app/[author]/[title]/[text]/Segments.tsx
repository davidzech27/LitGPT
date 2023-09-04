"use client"
import { useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"

interface Props {
	index: number
	segments: string[]
}

export default function Segments({ index: initialIndex, segments }: Props) {
	const [index, setIndex] = useState(initialIndex)

	const canScrollRef = useRef(true)

	const touchXRef = useRef(0)

	return (
		<div
			onWheel={(e) => {
				console.log(e.deltaX)

				if (canScrollRef.current && Math.abs(e.deltaX) >= 15) {
					if (e.deltaX < 0)
						setIndex((prevIndex) => Math.max(prevIndex - 1, 0))

					if (e.deltaX > 0)
						setIndex((prevIndex) =>
							Math.min(prevIndex + 1, segments.length - 1),
						)

					canScrollRef.current = false
				}

				canScrollRef.current = !(Math.abs(e.deltaX) >= 15)
			}}
			onTouchStart={(e) => {
				touchXRef.current = e.touches[0]?.clientX ?? 0
			}}
			onTouchMove={(e) => {
				const touchX = e.touches[0]?.clientX ?? 0

				const deltaX = touchX - touchXRef.current

				touchXRef.current = touchX

				console.log(deltaX)

				if (canScrollRef.current && Math.abs(deltaX) >= 5) {
					if (deltaX > 0)
						setIndex((prevIndex) => Math.max(prevIndex - 1, 0))

					if (deltaX < 0)
						setIndex((prevIndex) =>
							Math.min(prevIndex + 1, segments.length - 1),
						)

					canScrollRef.current = false
				}

				canScrollRef.current = !(Math.abs(deltaX) >= 5)
			}}
		>
			<div className="mb-2.5 flex justify-between">
				<div className="flex gap-1.5">
					<div className="font-medium">{index + 1}</div>

					<AnimatePresence>
						{index !== initialIndex && (
							<motion.button
								onClick={(e) => {
									e.stopPropagation()

									setIndex(initialIndex)
								}}
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{
									duration: 0.2,
									ease: "easeOut",
								}}
								className="font-light text-black/30 outline-none transition duration-200 ease-out hover:font-medium hover:text-black/100 focus-visible:font-medium focus-visible:text-black/100 active:font-medium active:text-black/100"
							>
								{initialIndex + 1}
							</motion.button>
						)}
					</AnimatePresence>
				</div>

				<div className="font-medium">{segments.length}</div>
			</div>

			<AnimatePresence>
				<motion.p
					key={index}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{
						duration: 0.2,
						ease: "easeOut",
					}}
					className="whitespace-pre-wrap"
				>
					{segments[index]?.trim()}
				</motion.p>
			</AnimatePresence>
		</div>
	)
}
