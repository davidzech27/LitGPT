import "./globals.css"

export const metadata = {
	title: { default: "LitGPT", template: "%s | LitGPT" },
	description: "Find any scene in any book",
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="en" className="absolute inset-0">
			<body>{children}</body>
		</html>
	)
}
