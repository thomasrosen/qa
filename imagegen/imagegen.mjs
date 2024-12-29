import FormData from 'form-data'
import fs from 'fs'
import fetch from 'node-fetch'

const API_TOKEN = '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'
const MODEL = 'stabilityai/stable-diffusion-xl-refiner-1.0'

console.log('Generating image...')

const formData = new FormData()
formData.append('text', 'A photo of a rocket launching into space')
formData.append('num_inference_steps', 5)
formData.append('image_dimensions', '1024x1024')
formData.append('image', fs.createReadStream('test-image-small.png'))

console.log('Sending request to Hugging Face Inference API...')

const response = await fetch(
  `https://api-inference.huggingface.co/models/${MODEL}`,
  {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
    },
    body: formData,
  }
)

if (response.status !== 200) {
  const error = await response.text()
  console.error('Error generating image', error)
} else {
  const imageData = Buffer.from(await response.arrayBuffer())
  // Save image data to file with fs.writeFile or do something else with it
  console.log('Image generated', imageData.length)
  fs.writeFileSync('output.jpg', imageData)

}
