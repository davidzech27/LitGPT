"use client"
import { useEffect, useRef } from "react"

interface Props {
	index: number
	segments: string[]
}

export default function Segments({ index, segments }: Props) {
	const scrollContainerRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (scrollContainerRef.current !== null)
			scrollContainerRef.current.scrollLeft =
				scrollContainerRef.current.clientWidth
	}, [])

	return (
		<div className="relative">
			<p className="whitespace-pre-wrap">{segments[index]}</p>{" "}
			<div
				ref={scrollContainerRef}
				className="absolute inset-0 overflow-x-scroll"
			>
				<div className="w-[300%]" />
			</div>
		</div>
	)
}
