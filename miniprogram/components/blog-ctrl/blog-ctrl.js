// components/blog-ctrl/blog-ctrl.js
let userInfo = {}// 用户信息
const db = wx.cloud.database()
Component({
  options:{
    addGlobalClass:true
  },
  /**
   * 组件的属性列表
   */
  properties: {
    blogId: String,
    blog: Object,// blog父组件传过来的blog对象
  },

  /**
   * 组件的初始数据
   */
  data: {
    loginShow:false,// 是否显示授权登录
    modalShow: false,   // 底部弹出层是否显示
    content: '',
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onComment() {
      // 判断用户是否授权
      wx.getSetting({
        success: (res) => {
          if (res.authSetting['scope.userInfo']) {
            wx.getUserInfo({
              success: (res) => {
                userInfo = res.userInfo
                // 显示评论弹出层
                this.setData({
                  modalShow: true,
                })
              }
            })
          } else {
            this.setData({
              loginShow: true,
            })
          }
        }
      })
    },
    onLoginsuccess(event) {
      userInfo = event.detail
      // 授权框消失，评论框显示
      this.setData({
        loginShow: false,
      }, () => {
        this.setData({
          modalShow: true,
        })
      })
    },

    onLoginfail() {
      wx.showModal({
        title: '授权用户才能进行评价',
        content: '🤪🤪🤪',
      })
    },
    onInput(event){
      this.setData({
        content:event.detail.value
      })
    },
    onSend(){
      let content = this.data.content
      if (content.trim() == '') {
        wx.showModal({
          title: '评论内容不能为空',
          content: '🤪🤪🤪',
        })
        return
      }
      wx.showLoading({
        title: '评论中',
        mask: true,
      })
      db.collection('blog-comment').add({// 插入云数据库
        data: {
          content,
          createTime: db.serverDate(),
          blogId: this.properties.blogId,
          nickName: userInfo.nickName,
          avatarUrl: userInfo.avatarUrl
        }
      }).then(res => {
        wx.hideLoading()
        wx.showToast({
          title: '评论成功',
        })
        this.setData({
          modalShow: false,
          content: '',
        })
         // 父元素刷新评论页面
         this.triggerEvent('refreshCommentList')
      })
    }
  }
})
