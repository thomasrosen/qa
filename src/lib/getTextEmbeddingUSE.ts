// import * as tf from '@tensorflow/tfjs-node'
// import * as use from '@tensorflow-models/universal-sentence-encoder'

// Import @tensorflow/tfjs or @tensorflow/tfjs-core
import * as tf from '@tensorflow/tfjs'
// Adds the WASM backend to the global backend registry.
// Set the backend to WASM and wait for the module to be ready.
// tf.setBackend('wasm').then(() => main());
import { setWasmPaths } from '@tensorflow/tfjs-backend-wasm'

let wasmInitialized = false
let use_model_cache: any = null

async function loadUseModel() {
  if (use_model_cache) {
    return use_model_cache
  }

  if (wasmInitialized === false) {
    setWasmPaths('./node_modules/@tensorflow/tfjs-backend-wasm/wasm-out/')
    // setThreadsCount(2) // setThreadsCount comes from @tensorflow/tfjs-backend-wasm
    await tf.setBackend('wasm')
    wasmInitialized = true
    // console.log('getThreadsCount', await getThreadsCount()) // getThreadsCount comes from @tensorflow/tfjs-backend-wasm
  }

  // const usem_model = await tf.loadGraphModel(
  //   'https://tfhub.dev/google/universal-sentence-encoder-multilingual/3',
  //   {
  //     fromTFHub: true,
  //     fetchFunc: (url: RequestInfo | URL, init?: any) => {
  //       console.log('fetchFunc', url)
  //       return fetch(url, { cache: 'no-store' })
  //     },
  //   }
  // )
  // console.log('usem_model', usem_model)
  // const y = model.predict(img)

  const use = await import('@tensorflow-models/universal-sentence-encoder')

  // Load the Universal Sentence Encoder model
  const use_model = await use.load()

  use_model_cache = use_model

  return use_model
}

export async function getTextEmbedding(text: string): Promise<number[] | null> {
  try {
    if (!text || typeof text !== 'string' || text.length === 0) {
      return null
    }

    const use_model = await loadUseModel()
    const embeddings = await use_model.embed([text])
    const embeddingsArray = await embeddings.array()

    if (embeddingsArray.length === 0) {
      return null
    }

    return embeddingsArray[0]
  } catch (error) {
    console.error('ERROR_BO2bU184', error)
  }

  return null
}
