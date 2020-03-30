// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const rp = require('request-promise')
const db = cloud.database()
const URL = 'http://musicapi.xiecheng.live/personalized'
let playlistCollection = db.collection('playlist')
const MAX_NUM = 100 //每次获取数据的最大数量

// 云函数入口函数
exports.main = async (event, context) => {
  // const list = await playlistCollection.get()
  // 优化突破云数据库每次只能获取100条数据
  const countResult = await playlistCollection.count() // 返回的是对象
  const total = countResult.total
  const batchTimes = Math.ceil(total / MAX_NUM)
  const tasks = [] // 任务队列
  for (let i = 0; i < batchTimes; i++) {  
    let promise = playlistCollection.skip(i * MAX_NUM).limit(MAX_NUM).get()
    tasks.push(promise)
  }
  let list = {
    data:[]
  }
  if (tasks.length > 0) {
    list = (await Promise.all(tasks)).reduce((acc, cur) => {
      return {
        data :acc.data.concat(cur.data)
      }
    })
  }

  //请求歌单数据
  const playlist = await rp(URL).then(res => {
    return JSON.parse(res).result
  })
  // 歌单数据去重
  const newList = []
  for (let i = 0, len1 = playlist.length; i < len1; i++) {
    let flag = true
    for (let j = 0, len2 = list.data.length; j < len2; j++) {
      if (playlist[i].id === list[j].id) {
        flag = false
        break
      }
      if (flag) {
        newList.push(playlist[i])
      }
    }
  }

  // console.log(playlist)
  // 将歌单数据插入数据库
  for (let i = 0, len = playlist.length; i < len; i++) {
    await playlistCollection.add({
      data: {
        ...playlist[i],
        createTime: db.serverDate()
      }
    }).then(res => {
      console.log('数据录入成功！')
    }).catch(err => {
      console.error('数据录入失败！')
    })
  }
}