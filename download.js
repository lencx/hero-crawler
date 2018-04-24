
const fs = require('fs-extra')
const utils = require('./utils')

const downloadHeroImg = data => {
    let herolistImg = []
    data.heroList.some(i => {
        let img1 = i.heroimg
        let img2 = i.faceimg
        let name = i.pinyin
        !/^http/.test(img1) ? img1 = `https:${img1}` : ''
        !/^http/.test(img2) ? img2 = `https:${img2}` : ''
        herolistImg.push({
            uri: img1,
            path: `${utils.heroimg}${name}.png`,
            name
        }, {
            uri: img2,
            path: `${utils.faceimg}${name}.png`,
            name
        })
    })
    utils.downloadPic(herolistImg)
}

utils.readOrigin((err, data) => {
    downloadHeroImg(JSON.parse(data))
    // getHeroDatail(JSON.parse(data))
    let herolist = []
    JSON.parse(data).heroList.some(i => {
        let title = i.title.split('-')[2]
        let heroimg = `${utils.heroimg}${i.pinyin}.png`
        let faceimg = `${utils.faceimg}${i.pinyin}.png`
        let camptype = i.camptype
        herolist.push({title, camptype, heroimg, faceimg})
    })
    let d = {
        heroCamp: JSON.parse(data).heroCamp,
        heroList: herolist
    }
    fs.writeFile(`${utils.newHerosOrigin}.json`, JSON.stringify(d, null, 2), () => console.log(`\x1b[33m\`${utils.newHerosOrigin}.json\` \x1b[35mwritten successfully!\x1b[0m`))
})
