import { Configuration, OpenAIApi } from "openai-edge"

import env from "~/env.mjs"

const configuration = new Configuration({
	apiKey: env.OPENAI_SECRET_KEY,
})

const openai = new OpenAIApi(configuration)

export default openai
