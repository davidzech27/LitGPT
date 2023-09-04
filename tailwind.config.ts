import { type Config } from "tailwindcss"

const config: Config = {
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			keyframes: {
				pulse: {
					"0%": {
						opacity: "0",
					},
					"50%": {
						opacity: "1",
					},
					"100%": {
						opacity: "0",
					},
				},
			},
			screens: { mobile: { max: "1024px" } },
		},
	},
	plugins: [],
}
export default config
