const rp = require('request-promise')
const fs = require('fs-extra')
const path = require('path')
const config = require('config')

const resolve = (...dir) => path.relative(__dirname, ...dir)
const filePathExists = (pathname, cb) => fs.pathExists(resolve(`${config.dataDir}/${pathname}.json`), cb)

// const downloadImg = async (src, dest) => {
//     return await rp(src)
//         .on('error', err => {
//             console.log(err)
//         })
//         .pipe(fs.createWriteStream(dest))
//         .on('finish', () => console.log('finish'))
// }

const downloadPic = async data => {
    console.log(`########### Total \x1b[35m[${data.length}]\x1b[0m Pictures #############`)
    let pics = data.map(d => rp(d.uri)
        .on('error', err => console.log(`\x1b[31m[fail]\x1b[0m \x1b[36m${d.name} finish\x1b[0m`))
        .pipe(fs.createWriteStream(d.path))
        .on('finish', () => console.log(`\x1b[32m[ok]\x1b[0m \x1b[36m${d.name} finish\x1b[0m`))
    )
    await Promise.all(pics)
}

module.exports = {
    resolve,
    filePathExists,
    downloadPic
}
