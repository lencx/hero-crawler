const cheerio = require('cheerio')
const fs = require('fs-extra')
const rp = require('request-promise')
const config = require('config')

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
                        () => console.log(`\x1b[35m[ok] \x1b[33mHeros list\x1b[0m`)
                    )
                })
        }
    })
}

dirInit()
writeHeroOriginFile()
