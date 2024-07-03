import { fileURLToPath } from 'node:url'
import { transform } from 'oxc-transform'

const extensionsRegex = /\.tsx?$/

export async function load(url, context, nextLoad) {
  if (extensionsRegex.test(url)) {
    const { source: rawSource } = await nextLoad(url, {
      ...context,
      format: 'module'
    })

    const { sourceText: transformedSource, map } = transform(
      fileURLToPath(url),
      rawSource.toString(),
      { sourcemap: true }
    )

    const mapString = JSON.stringify(map)

    const sourceWithMap =
      transformedSource +
      `\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,` +
      Buffer.from(mapString).toString('base64')

    console.log(transformedSource)

    return {
      format: 'module',
      shortCircuit: true,
      source: sourceWithMap
    }
  }

  // Let Node.js handle all other URLs.
  return nextLoad(url)
}
