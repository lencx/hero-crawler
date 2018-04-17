const cheerio = require('cheerio')
const fs = require('fs-extra')
const Iconv = require('iconv').Iconv
const rp = require('request-promise')
const config = require('config')
const iconv = new Iconv('GBK', 'UTF-8')

const utils = require('./utils')
const api = config.api
const img = config.imgFiles
const heroimg = config.imgDir + img.get('heroImg')
const faceimg = config.imgDir + img.get('heroFace')
let heroOriginFile = utils.resolve(`${config.dataDir}/${config.dataFiles.heroListOrigin}.json`)

/**
 * get data
 * data: heroCamp & heroList
 * @return {Promise}
 */
const getHeros = async () => {
    let heroCamp = []
    const opts = {
        uri: api.heroCamp,
        transform: body => cheerio.load(body)
    }
    const $ = await rp(opts)
    
    $('#campNav li').each(function() {
        const type = $(this).attr('data-camptype')
        const txt = $(this).find('a').text()
        heroCamp.push({type, txt})
    })

    let heroList = await rp({uri: api.heroList})

    heroList = JSON.parse(heroList.replace(/^createHeroList\(|\)$/g, ''))
    heroList = heroList.data.filter(item => item)

    return {
        heroCamp,
        heroList
    }
}

/**
 * When the `img` file does not exist, create it.
 */
utils.filePathExists('img', (err, exist) => {
    if(!exist) {
        fs.ensureDir(heroimg)
        fs.ensureDir(faceimg)
    }
})

/**
 * filename: heros.json
 * data: heroCamp & heroList
 */
utils.filePathExists(`${config.dataFiles.heroListOrigin}`, (err, exist) => {
    if(!exist) {
        getHeros()
            .then(data => {
                fs.ensureDir(utils.resolve(`${config.dataDir}`))
                    .then(() => fs.writeFile(
                        utils.resolve(`${config.dataDir}${config.dataFiles.heroListOrigin}.json`),
                        JSON.stringify(data, null, 2),
                        () => console.log(`\x1b[33m\`${config.dataFiles.heroListOrigin}.json\` \x1b[35mwritten successfully!\x1b[0m`)
                    ))
            })
    }
})

const downloadHeroImg = data => {
    let herolistImg = []
    data.heroList.some(i => {
        let img1 = i.heroimg
        let img2 = i.faceimg
        let name = i.pinyin
        !/^http/.test(img1) ? img1 = `http:${img1}` : ''
        !/^http/.test(img2) ? img2 = `http:${img2}` : ''
        herolistImg.push({
            uri: img1,
            path: `${heroimg}${name}.png`,
            name
        }
        , {
            uri: img2,
            path: `${faceimg}${name}.png`,
            name
        }
        )
    })
    utils.downloadPic(herolistImg)
}

fs.readFile(heroOriginFile, {encoding: 'UTF-8'}, (err, data) => {
    downloadHeroImg(JSON.parse(data))
})

// const getHeroDatail = async (url, id) => {
//     const opts = {
//         encoding: null,
//         url
//     }

//     const $ = await rp(opts)
//         .then(body => {
//             const result = iconv.convert(new Buffer(body, 'binary').toString())
//             return cheerio.load(result)
//         })
// }