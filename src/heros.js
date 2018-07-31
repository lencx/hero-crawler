const cheerio = require('cheerio')
const fs = require('fs-extra')
const rp = require('request-promise')
const {api, heroInfo, resolve, writeFile} = require('./utils')

// init
const herosInit = () => {
    fs.exists(resolve(`${heroInfo.herosOrigin}/hero-camp.json`))
        .then(async exist => {
            if(!exist) await heroListWriteFile()
        })
}

// hero data wirte file
// data: heroCamp & heroList
const heroListWriteFile = async () => {
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

    writeFile(`${heroInfo.herosOrigin}/hero-camp.json`, heroCamp, 'Heros Camp')
    writeFile(`${heroInfo.herosOrigin}/hero-list.json`, heroList, 'Heros List')
}

herosInit()