const cheerio = require('cheerio')
const fs = require('fs-extra')
const Iconv = require('iconv').Iconv
const rp = require('request-promise')
const cn = new Iconv('GBK', 'UTF-8')

const {heroInfo, resolve, writeFile, readFile, print, htmlDecode} = require('./utils')

const _detail = heroInfo.detailOrigin
const _hero = heroInfo.herosOrigin

const getHeroDetail = (uri, id, name) => {
    let filename = resolve(`${_detail}/${name}.json`)
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
                            text: htmlDecode($(this).html().trim())
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

                writeFile(filename, info, `Hero Detail-${info.name}`)
            } else {
                print(`Hero Detail-${name}`, true)
            }
        }
    })
}

const herosDetailFile = () => {
    // console.log(`${_hero}/hero-list.json`)
    readFile(`${_hero}/hero-list.json`, (err, data) => {
        JSON.parse(data).some(item => {
            let uri = item.infourl
            let id = item.heroid
            let name = item.pinyin
            !/^http/.test(uri) ? uri = `https:${uri}` : ''
            getHeroDetail(uri, id, name)
        })
    })
}

herosDetailFile()