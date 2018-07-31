
const fs = require('fs-extra')
const {heroInfo, readFile, downloadPic, writeFile} = require('./utils')
const _hero = heroInfo.herosOrigin
const _heroimg = heroInfo.heroimg
const _faceimg = heroInfo.heroface

const herosImg = data => {
    let herolistImg = []
    data.some(i => {
        let img1 = i.heroimg
        let img2 = i.faceimg
        let name = i.pinyin
        !/^http/.test(img1) ? img1 = `https:${img1}` : ''
        !/^http/.test(img2) ? img2 = `https:${img2}` : ''
        herolistImg.push({
            uri: img1,
            path: `${_heroimg}${name}.png`,
            name
        }, {
            uri: img2,
            path: `${_faceimg}${name}.png`,
            name
        })
    })
    // console.log(herolistImg)
    downloadPic(herolistImg)
}

readFile(`${_hero}/hero-list.json`, (err, data) => {
    let herolist = []
    JSON.parse(data).some(i => {
        let title = i.title.split('-')[2]
        let heroimg = `${_heroimg}${i.pinyin}.png`
        let faceimg = `${_faceimg}${i.pinyin}.png`
        let camptype = i.camptype
        herolist.push({title, camptype, heroimg, faceimg})
    })
    let filename = `${heroInfo.herosNew}/hero-list.json`
    writeFile(filename, herolist, `${filename} - successfully written!`)

    herosImg(JSON.parse(data))
})