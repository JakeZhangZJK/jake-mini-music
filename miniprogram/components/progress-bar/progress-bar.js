let movableAreaWidth = 0 // 进度条的宽度
let  movableViewWidth = 0 // 进度条上白色圆点的宽度
const backgroundAudioManager = wx.getBackgroundAudioManager()
let currentSec = -1 // 当前的秒数
let duration = 0 // 当前歌曲的总时长，以秒为单位，用于参与计算
let isMoving = false // 表示当前进度条是否在拖拽，解决：当进度条拖动时候和updatetime事件有冲突的问题
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isSame:Boolean
  },

  /**
   * 组件的初始数据
   */
  data: {
    showTime: {
      currentTime: '00:00',
      totalTime: '00:00',
    },
    movableDis: 0,// 小圆圈移动的距离
    progress: 0,// 进度条移动的距离
  },

  // 组件的生命周期函数
  lifetimes: {
      /**
   * 生命周期函数--监听页面初次渲染完成
   */
    ready() {
      if (this.properties.isSame && this.data.showTime.totalTime == '00:00') {
        this._setTime()
      }
      this._getMovableDis()
      this._bindBGMEvent()
    },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    onChange(event) {
      // console.log(event)
      // 拖动
      if (event.detail.source == 'touch') {
        this.data.progress = event.detail.x / (movableAreaWidth - movableViewWidth) * 100
        this.data.movableDis = event.detail.x
        isMoving = true
        // console.log('change', isMoving)
      }
    },
    // 拖动结束
    onTouchEnd() {
      const currentTimeFmt = this._dateFormat(Math.floor(backgroundAudioManager.currentTime))
      this.setData({
        progress: this.data.progress,
        movableDis: this.data.movableDis,
        ['showTime.currentTime']: currentTimeFmt.min + ':' + currentTimeFmt.sec
      })
      // 歌曲进度联动
      backgroundAudioManager.seek(duration * this.data.progress / 100)
      isMoving = false
      // console.log('end', isMoving)
    },
    _getMovableDis() {
      const query = this.createSelectorQuery() // 类似原生js获取元素属性的方法
      query.select('.movable-area').boundingClientRect()// 获取到当前元素的宽度
      query.select('.movable-view').boundingClientRect()
      query.exec((rect) => {// 执行所有请求，形成数组，然后返回
        // console.log(rect)
        movableAreaWidth = rect[0].width
        movableViewWidth = rect[1].width
        // console.log(movableAreaWidth, movableViewWidth)
      })

    },
    _bindBGMEvent() {
      backgroundAudioManager.onPlay(() => {
        console.log('onPlay')
        isMoving = false
        this.triggerEvent('musicPlay')
      })

      backgroundAudioManager.onStop(() => {
        console.log('onStop')
      })

      // 暂停
      backgroundAudioManager.onPause(() => {
        console.log('Pause')
        this.triggerEvent('musicPause')
      })

      backgroundAudioManager.onWaiting(() => {
        console.log('onWaiting')
      })

      backgroundAudioManager.onCanplay(() => {
        // console.log('onCanplay')
        console.log(backgroundAudioManager.duration)
        // duration 为歌曲的真实时长，（一个小坑：duration有时会获取不到，需要做判断）
        if (typeof backgroundAudioManager.duration != 'undefined') {
          this._setTime()
        } else {
          setTimeout(() => {// 如果获取不到，就等待1秒再次获取
            this._setTime()
          }, 1000)
        }
      })
      backgroundAudioManager.onTimeUpdate(() => {
        // console.log('onTimeUpdate')
        if (!isMoving) {
          const currentTime = backgroundAudioManager.currentTime //获取当前已播放的时间
          const duration = backgroundAudioManager.duration // 获取歌曲总时长
          // 优化：在设置当前已播放时长的时候每秒会进行4次设置影响性能，而当前已播放时长是以秒为单位变化的，因此需要减少setData频率
          const sec = currentTime.toString().split('.')[0]
          if (sec != currentSec) {
            // console.log(currentTime)
            const currentTimeFmt = this._dateFormat(currentTime)// 格式化已播放的时长
            this.setData({
              movableDis: (movableAreaWidth - movableViewWidth) * currentTime / duration,
              progress: currentTime / duration * 100,
              ['showTime.currentTime']: `${currentTimeFmt.min}:${currentTimeFmt.sec}`,
            })
            currentSec = sec
            this.triggerEvent('timeUpdate', {
              currentTime
            })
          }
        }
      })

      backgroundAudioManager.onEnded(() => {
        console.log("onEnded")
        this.triggerEvent('musicEnd')// 当当前歌曲播放结束，向外抛出事件
      })

      backgroundAudioManager.onError((res) => {
        console.error(res.errMsg)
        console.error(res.errCode)
        wx.showToast({
          title: '错误:' + res.errCode,
        })
      })
    },
    // 
    _setTime() {
      duration = backgroundAudioManager.duration
      const durationFmt = this._dateFormat(duration)
      this.setData({
        // 给对象中的某一个属性赋值：['对象名.属性名']
        ['showTime.totalTime']: `${durationFmt.min}:${durationFmt.sec}`
      })
    },
    // 格式化时间
    _dateFormat(sec) {
      // 分钟
      const min = Math.floor(sec / 60)
      // 秒
      sec = Math.floor(sec % 60)
      return {
        'min': this._parse0(min),
        'sec': this._parse0(sec),
      }
    },
    // 补零
    _parse0(sec) {
      return sec < 10 ? '0' + sec : sec
    }
  }
})
