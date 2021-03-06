#!/usr/bin/env node

//
// sbpak - A javascript utility to pack and unpack Starbound pak files.
//
// @copyright (c) 2018 Damian Bushong <katana@odios.us>
// @license MIT license
// @url <https://github.com/damianb/sbpak>
//

import * as app from 'commander'
import * as fs from 'fs'
import * as path from 'path'

const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json')).toString())

app
  .version(pkg.version, '-v, --version')
  .command('files <pak>', 'get the list of all files in a pak', {
    isDefault: true
  })
  .command('meta <pak>', 'get the metadata for a pak file')
  .command('dump <pak> <file> [destination]', 'dump out the contents of a single file within a pak')
  .command('pack <directory> <pak>', 'create a new pak file')
  .command('unpack <pak> <directory>', 'unpack a pak file in the given directory')
  .parse(process.argv)
