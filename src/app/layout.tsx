import "./globals.css"

export const metadata = {
	title: { default: "LitGPT", template: "%s | LitGPT" },
	description: "Find any scene from your AP Lit books",
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="en">
			<body className="absolute inset-0">{children}</body>
		</html>
	)
}
