"use client"
import { useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"

interface Props {
	index: number
	segments: string[]
}

export default function Segments({ index: indexProp, segments }: Props) {
	const [index, setIndex] = useState(indexProp)

	const canScrollRef = useRef(true)

	const touchXRef = useRef(0)

	return (
		<div
			onWheel={(e) => {
				console.log(e.deltaX)

				if (canScrollRef.current && Math.abs(e.deltaX) >= 10) {
					if (e.deltaX < 0)
						setIndex((prevIndex) => Math.max(prevIndex - 1, 0))

					if (e.deltaX > 0)
						setIndex((prevIndex) =>
							Math.min(prevIndex + 1, segments.length - 1),
						)

					canScrollRef.current = false
				}

				canScrollRef.current = !(Math.abs(e.deltaX) >= 10)
			}}
			onTouchStart={(e) => {
				touchXRef.current = e.touches[0]?.clientX ?? 0
			}}
			onTouchMove={(e) => {
				const touchX = e.touches[0]?.clientX ?? 0

				const deltaX = touchX - touchXRef.current

				touchXRef.current = touchX

				console.log(deltaX)

				if (canScrollRef.current && Math.abs(deltaX) >= 10) {
					if (deltaX > 0)
						setIndex((prevIndex) => Math.max(prevIndex - 1, 0))

					if (deltaX < 0)
						setIndex((prevIndex) =>
							Math.min(prevIndex + 1, segments.length - 1),
						)

					canScrollRef.current = false
				}

				canScrollRef.current = !(Math.abs(deltaX) >= 10)
			}}
		>
			<div className="mb-2.5 flex justify-between">
				<div className="font-medium">{index + 1}</div>

				<div className="font-medium">{segments.length}</div>
			</div>

			<AnimatePresence>
				<motion.p
					key={index}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{
						ease: "easeOut",
						duration: 0.15,
					}}
					className="whitespace-pre-wrap"
				>
					{segments[index]?.trim()}
				</motion.p>
			</AnimatePresence>
		</div>
	)
}
