const cheerio = require('cheerio')
const fs = require('fs-extra')
const Iconv = require('iconv').Iconv
const rp = require('request-promise')
const config = require('config')
const cn = new Iconv('GBK', 'UTF-8')

const utils = require('./utils')
const api = config.api

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
 * When the `img`, `database` file does not exist, create it.
 */
const dirInit = () => {
    utils.pathExists(`${utils.heroimg}`, 'img')
    utils.pathExists(`${utils.faceimg}`, 'img')
    utils.pathExists(`${utils.heroOrigin}.json`)
}

/**
 * filename: heros.json
 * data: heroCamp & heroList
 */
const writeHeroOriginFile = () => {
    fs.exists(`${utils.heroOrigin}.json`, exist => {
        if(!exist) {
            getHeros()
                .then(data => {
                    fs.writeFile(
                        utils.resolve(`${utils.heroOrigin}.json`),
                        JSON.stringify(data, null, 2),
                        () => console.log(`\x1b[33m\`${utils.heroOrigin}.json\` \x1b[35mwritten successfully!\x1b[0m`)
                    )
                })
        }
    })
}

dirInit()
writeHeroOriginFile()



const getHeroDatail = async (uri, id) => {
    const opts = {
        encoding: null,
        uri
    }
    console.log(opts)

    const $ = await rp(opts)
        .then(body => {
            // console.log(body)
            const result = cn.convert(new Buffer(body), 'binary').toString()
            // console.log(result)
            return cheerio.load(result)
            // console.log($('#wrap .tips'))
        })
        
    let heroinfo = {
        name: $('.heroinfo h2').text(),
        nickname: $('.heroinfo h3').text(),
        dubber: $('.heroinfo #dub span').text(),
        tips: $('#wrap .tips').text(),
        content: $('.content .textboxs p').text()
    }
    console.log(heroinfo)
}

// let info = 'http://pvp.qq.com/webplat/info/news_version3/15592/27363/28440/m17324/201803/698379.shtml?ADTAG=pvp.storyweb'
// getHeroDatail(info, '001')