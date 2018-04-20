const rp = require('request-promise')
const fs = require('fs-extra')
const path = require('path')
const config = require('config')

const resolve = (...dir) => path.relative(__dirname, ...dir)
const filePathExists = (pathname, cb) => fs.pathExists(resolve(`${config.dataDir}/${pathname}.json`), cb)

const pathExists = (pathname, type) => {
    let dir = () => resolve(`${type === 'img' ? pathname : config.dataDir}`)
    fs.pathExists(dir(), (err, exist) => fs.ensureDir(dir()))
}

const downloadPic = async data => {
    console.log(`########### Total \x1b[35m[${data.length}]\x1b[0m Pictures #############`)
    let pics = data.map(d => rp(d.uri)
        .on('error', err => console.log(`\x1b[31m[fail]\x1b[0m \x1b[36m${d.name} finish\x1b[0m`))
        .pipe(fs.createWriteStream(d.path))
        .on('finish', () => console.log(`\x1b[32m[ok]\x1b[0m \x1b[36m${d.name} finish\x1b[0m`))
    )
    await Promise.all(pics)
}

const heroimg = config.imgDir + config.get('imgFiles.heroImg')
const faceimg = config.imgDir + config.get('imgFiles.heroFace')
const heroOrigin = config.dataDir + config.get('dataFiles.herosOrigin')
const heroDetailOrigin = config.dataDir + config.get('dataFiles.herosDetailOrigin')
const newHerosOrigin = config.dataDir + config.get('dataFiles.newHerosOrigin')

module.exports = {
    resolve,
    filePathExists,
    pathExists,
    downloadPic,

    heroimg,
    faceimg,
    heroOrigin,
    heroDetailOrigin,
    newHerosOrigin,
}
