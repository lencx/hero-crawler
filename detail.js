const cheerio = require('cheerio')
const fs = require('fs-extra')
const Iconv = require('iconv').Iconv
const rp = require('request-promise')
const cn = new Iconv('GBK', 'UTF-8')

const utils = require('./utils')

const getHeroDetail = (uri, id, name) => {
    let filename = utils.resolve(`${utils.heroDetailOrigin}-${name}.json`)
    fs.exists(filename, async exist => {
        if(!exist) {
            let heroDetail = []

            const $ = await rp({encoding: null, uri})
                .then(body => {
                    const result = cn.convert(new Buffer(body), 'binary').toString()
                    return cheerio.load(result)
                })

            if($('.content .textboxs').length > 0) {
                $('.content .textboxs p').each(function(_, index) {
                    if($(this).find('img').length > 0) {
                        let src = $(this).find('img').attr('src')
                        !/^http/.test(src) ? src = `https:${src}` : ''
                        heroDetail.push({
                            type: 'img',
                            text: src
                        })
                    } else {
                        heroDetail.push({
                            type: 'txt',
                            // text: $(this).text().trim()
                            text: utils.htmlDecode($(this).html().trim())
                        })
                    }
                })
                let info = {
                    _id: id,
                    name: $('.heroinfo h2').text().trim(),
                    nickname: $('.heroinfo h3').text().trim(),
                    dubber: $('.heroinfo #dub span').text().trim(),
                    tips: $('#wrap .tips').text().trim(),
                    content: heroDetail
                }

                fs.writeFile(
                    filename,
                    JSON.stringify(info, null, 2),
                    () => console.log(`\x1b[35m[ok]\x1b[0m Hero Detail-\x1b[33m${info.name}\x1b[0m`)
                )
            } else {
                console.log(`\x1b[31m[fail]\x1b[0m Hero Detail-\x1b[33m${name}\x1b[0m`)
            }
        }
    })
}

utils.readOrigin((err, data) => {
    JSON.parse(data).heroList.some(item => {
        let uri = item.infourl
        let id = item.heroid
        let name = item.pinyin
        
        !/^http/.test(uri) ? uri = `https:${uri}` : ''
        getHeroDetail(uri, id, name)
    })
})

console.log('\u7A37')