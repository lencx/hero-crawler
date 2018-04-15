const cheerio = require('cheerio')
const fs = require('fs-extra')
const rp = require('request-promise')
const Iconv = require('iconv').Iconv
const cn = new Iconv('GBK', 'UTF-8')
const path = require('path')
const resolve = (...dir) => path.relative(__dirname, ...dir)
const filePathExists = (pathname, cb) => fs.pathExists(resolve(`database/${pathname}.json`), cb)

const uri = {
    heroCamp: 'https://pvp.qq.com/act/a20160510story/herostory.htm',
    heroList: 'https://pvp.qq.com/webplat/info/news_version3/15592/18024/23901/24397/24398/m17330/list_1.shtml'
}

const getHeros = async () => {
    let heroCamp = []
    const opts = {
        uri: uri.heroCamp,
        transform: body => cheerio.load(body)
    }
    const $ = await rp(opts)
    
    $('#campNav li').each(function() {
        const type = $(this).attr('data-camptype')
        const txt = $(this).find('a').text()
        heroCamp.push({type, txt})
    })

    let heroList = await rp({uri: uri.heroList})

    heroList = JSON.parse(heroList.replace(/^createHeroList\(|\)$/g, ''))
    heroList = heroList.data.filter(item => item)

    return {
        heroCamp,
        heroList
    }
}

/**
 * filename: heros.json
 * data: campType & heroList
 */
filePathExists('heros', (err, exist) => {
    if(!exist) {
        getHeros()
        .then(data => {
        fs.ensureDir(resolve('database'))
            .then(() => fs.writeFile(
                resolve('database/heros.json'),
                JSON.stringify(data, null, 2),
                () => console.log('Hero file written successfully!')
            ))
        })
    }
})