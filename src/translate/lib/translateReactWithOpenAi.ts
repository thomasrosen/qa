import { OutputOptionsType } from '@/translate/types'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function translateReactWithOpenAi(
  text: string, // { text: 'ABC DEF', mapping: '<1>ABC</1> <1>DEF</1>' }
  outputOptions: OutputOptionsType
) {
  const prompt = `Translate the text from the user. Use these output options: ${JSON.stringify(
    outputOptions
  )}
The locale is an IETF language tag. THE LANGUAGE IS MORE IMPORTANT THAN THE REGION.
THE TRANSLATION MUST CONFORM TO ALL THE OUTPUT OPTIONS.
Use fitting short forms.
You get the raw text and the mapping of the text parts to ids.
Respond in this json structure: { text: "full translated text", parts: { 01: "translated part with whitespace", 02: "translated part with whitespace", … } } Be precise with the part ids.
Any letter from the full translation must be in the parts.
Leave the parts empty if no mapping was provided.
DO NOT REMOVE INFORMATION WHEN TRANSLATING.`

  const chatCompletion = await openai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: prompt,
      },
      { role: 'user', content: text },
    ],
    model: 'gpt-4-turbo',
    response_format: { type: 'json_object' },
  })

  if (!chatCompletion) {
    throw new Error('No chatCompletion')
  }

  if (!chatCompletion.choices || chatCompletion.choices.length === 0) {
    throw new Error('No chatCompletion.choices')
  }

  const firstChoice = chatCompletion.choices[0]
  const responseMessageContent = firstChoice.message.content

  if (!responseMessageContent || responseMessageContent === '') {
    throw new Error('No responseMessageContent')
  }

  try {
    return JSON.parse(responseMessageContent)
  } catch (error) {
    throw new Error('Could not parse responseMessageContent')
  }
}
