// components/musiclist/musiclist.js
const app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    musiclist: Array
  },

  /**
   * 组件的初始数据
   */
  data: {
    playingId: -1
  },
  // 组件生命周期函数
  pageLifetimes: {
    show() {
      this.setData({
        // 一个大坑：在点击歌曲列表时获取到的当前歌曲id是字符串类型，但是在播放界面播放当前歌曲列表输出的id值是number类型，所以在返回歌曲列表时，当前播放歌曲并不会高亮，所以需要做类型转换
        playingId: parseInt(app.getPlayMusicId()) // 将全局获取到的当前正在播放的歌曲的id，赋值给歌曲列表当前播放的歌曲id，实现联动高亮显示
      })

    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onSelect(event) {
      // 事件源 事件处理函数 事件对象 事件类型
      // console.log(event.currentTarget.dataset.musicid)
      const ds = event.currentTarget.dataset
      const musicid = ds.musicid
      this.setData({
        playingId: musicid
      })
      wx.navigateTo({
        url: `../../pages/player/player?musicId=${musicid}&index=${ds.index}`,
      })
    }
  }
})
