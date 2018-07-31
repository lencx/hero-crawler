// const rp = require('request-promise')
const fs = require('fs-extra')
const path = require('path')
const yaml = require('js-yaml')
const chalk = require('chalk')
const rp = require('request-promise')

let config,
    heroInfo = {}

const resolve = (...dir) => path.resolve(__dirname, '..', ...dir)

try {
    const conf = resolve('config.yml')
    config = yaml.safeLoad(fs.readFileSync(conf, 'utf8'))
} catch (e) {
    console.log(e)
}

// hero info init
const {api, database, sourcePath} = config
function deepProp(obj) {
    Object.keys(obj).forEach(i => {
        if(typeof obj[i] === 'object') {
            deepProp(obj[i])
        } else {
            let filename = sourcePath + obj[i]
            Object.assign(heroInfo, {[i]: filename})

            fs.pathExists(filename, (err, exist) => {
                if(!exist) fs.ensureDir(filename)
            })
        }
    })
}
deepProp(database)

/**
 * print
 * @param string info 
 * @param boolean isFail 
 */
const print = (info, isFail) => {
    if(isFail) return console.log(chalk.red('[fail]'), chalk.underline.bgBlack(` ${chalk.yellow(info)} `))
    else return console.log(chalk.magenta('[ok]'), chalk.underline.bgBlack(` ${chalk.cyan(info)} `))
}


/**
 * writeFile
 * @param string filename
 * @param object data
 * @param string info
 */
const writeFile = (filename, data, info) => fs.writeFile(resolve(filename), JSON.stringify(data, null, 2), print(info))

/**
 * readFile
 * @param string filename 
 * @param function cb
 */
const readFile = (filename, cb) => fs.readFile(filename, {encoding: 'UTF-8'}, cb)
const htmlDecode = str => str.replace(/&#(x)?(\w+);/g, ($, $1, $2) => String.fromCharCode(parseInt($2, $1 ? 16 : 10)))

// Download Picture
const downloadPic = data => {
    console.log(`########### Total \x1b[35m[${data.length}]\x1b[0m Pictures #############`)
    data.some(i => {
        rp(i.uri)
            .on('error', err => print(`${i.name}`, true))
            .pipe(fs.createWriteStream(resolve(i.path)))
            .on('finish', () => print(`${i.name}`))
    })
}

module.exports = {
    resolve,
    api,
    sourcePath,
    heroInfo,
    print,
    writeFile,
    readFile,
    htmlDecode,
    downloadPic,
}
