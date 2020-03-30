
const MAX_LIMIT = 15 // 每次查询歌单的最大长度
Page({

  /**
   * 页面的初始数据
   */
  data: {
    swiperImgUrls: [
      {
        url: '../../images/1.jpg',
      },
      {
        url: '../../images/2.jpg',
      },
      {
        url: '../../images/3.jpg',
      },
      {
        url: '../../images/4.jpg',
      },
      {
        url: '../../images/5.jpg  ',
      },
      {
        url: '../../images/6.jpg  ',
      }
    ],
    playlist: []

  },

  // 获取歌单列表
  _getPlaylist() { 
    wx.showLoading({
      title: '加载中',
      mask: true
    });
    wx.cloud.callFunction({
      name: 'music',
      data: {
        start: this.data.playlist.length,
        count: MAX_LIMIT,
        $url: 'playlist'
      }
    }).then(res => {
      console.log(res)
      this.setData({
        playlist:this.data.playlist.concat(res.result.data)
      })
    })
    wx.stopPullDownRefresh()
    wx.hideLoading();
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this._getPlaylist()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    this.setData({
      playlist:[]
    })
    this._getPlaylist()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    this._getPlaylist()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})