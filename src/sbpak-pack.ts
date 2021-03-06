//
// sbpak - A javascript utility to pack and unpack Starbound pak files.
//
// @copyright (c) 2018 Damian Bushong <katana@odios.us>
// @license MIT license
// @url <https://github.com/damianb/sbpak>
//

import * as fs from 'fs'
import * as path from 'path'
import * as readdir from 'recursive-readdir'

import * as app from 'commander'

import { SBAsset6 } from 'js-starbound'

const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json')).toString())

app
  .version(pkg.version, '-v, --version')
  .arguments('<directory> <pak>')
  .action(async (_source: string, pakPath: string) => {
    try {
      const source = path.resolve(process.cwd(), _source)
      try {
        await fs.promises.access(source, fs.constants.R_OK)
      } catch (err) {
        throw new Error('The specified source directory does not exist.')
      }

      const target = path.resolve(process.cwd(), pakPath)
      try {
        await fs.promises.access(path.dirname(target), fs.constants.R_OK)
      } catch (err) {
        throw new Error('The specified pak file parent directory does not exist.')
      }

      const pak = new SBAsset6(target)

      console.log(`creating pak ${target}`)
      console.log(`using files from ${source}`)
      const files = await readdir(source)

      const metadataFile = files.find((filename) => {
        return ['_metadata', '.metadata'].includes(path.basename(filename))
      })
      let metadata: any = null

      if (metadataFile !== undefined) {
        try {
          metadata = JSON.parse(await (await fs.promises.readFile(metadataFile)).toString())
        } catch (err) {
          throw new Error(`Failed to read and parse metadata file ${metadataFile}`)
        }

        console.log('setting metadata')
        pak.metadata = metadata
      }

      const promises = files
        .filter((filename) => {
          return !(['_metadata', '.metadata'].includes(path.basename(filename)))
        })
        .map(async (filename) => {
          let pakPath = filename.substring(source.length)
          if (process.platform === 'win32') {
            pakPath = pakPath.replace(/\\/g, '/')
          }
          await pak.files.setFile(pakPath, {
            source: {
              path: filename
            }
          })

          console.log(`added ${pakPath}`)
        })

      await Promise.all(promises)
      await pak.save()

      console.log('done!')
    } catch (err) {
      console.error(err)
      process.exit(1)
    }
  })
  .parse(process.argv)
