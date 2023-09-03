import { type NextRequest, NextResponse } from "next/server"
import * as cheerio from "cheerio"

import env from "~/env.mjs"
import qdrant from "~/qdrant"
import Book from "~/data/Book"

export const runtime = "edge"

const SEGMENT_WORD_SOFT_LIMIT = 750

const MAX_CONCURRENCY = 10

export const GET = async (request: NextRequest) => {
	if (env.NODE_ENV !== "development")
		return new NextResponse(null, { status: 403 })

	const titleParam = request.nextUrl.searchParams.get("title")

	const url = request.nextUrl.searchParams.get("url")

	if (titleParam === null || url === null)
		return new NextResponse(null, { status: 400 })

	const title = decodeURIComponent(titleParam)

	const html = await (await fetch(url, { method: "GET" })).text()

	if (html === null) return new NextResponse(null, { status: 400 })

	const $ = cheerio.load(html)

	const elements = Array.from($("h1, h2, p"))

	const chapters = elements.reduce<cheerio.Element[][]>(
		(prev, cur) =>
			["h1", "h2"].includes(cur.tagName) &&
			$(cur).text().toLowerCase().includes("chapter")
				? [...prev, [cur]]
				: [
						...prev.slice(0, prev.length - 1),
						[...(prev.at(-1) ?? []), cur],
				  ],

		[],
	)

	const segments = chapters.flatMap((elementGroup) => {
		const groupSegments: string[] = []

		let currentSegment = ""

		for (const element of elementGroup) {
			currentSegment += $(element).text()

			const currentSegmentWordCount = currentSegment.split(/\s+/).length

			if (currentSegmentWordCount > SEGMENT_WORD_SOFT_LIMIT) {
				groupSegments.push(currentSegment)

				currentSegment = ""
			}
		}

		if (currentSegment !== "") groupSegments.push(currentSegment)

		return groupSegments
	})

	console.info(segments.length, "segments")

	await qdrant({ collection: "litgpt" }).createCollection()

	let segmentIndex = 0

	const worker = async (workerIndex: number) => {
		console.info("Worker", workerIndex, ": started")

		while (segmentIndex < segments.length) {
			const currentSegmentIndex = segmentIndex

			segmentIndex++

			const segment = segments[currentSegmentIndex]

			if (segment === undefined) return

			console.info(
				"Worker",
				workerIndex,
				": segment",
				currentSegmentIndex,
				"started",
			)

			await Book({ title }).addSegment({
				index: currentSegmentIndex,
				content: segment,
			})

			console.info(
				"Worker",
				workerIndex,
				": segment",
				currentSegmentIndex,
				"uploaded",
			)
		}

		console.info("Worker", workerIndex, ": finished")
	}

	await Promise.all(
		Array(MAX_CONCURRENCY)
			.fill(0)
			.map((_, index) => worker(index)),
	)

	return new NextResponse(
		`<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8">
</head>
<body>
<pre>
${segments.join("-------------------")}
</pre>
</body>
</html>`,
		{ headers: { "Content-Type": "text/html" } },
	)
}
