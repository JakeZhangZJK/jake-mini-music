// components/bottom-modal/bottom-modal.js
Component({
  options: {
    addGlobalClass:true,
    multipleSlots: true,
  },
  /**
   * 组件的属性列表
   */
  properties: {
    modalShow:Boolean, // 控制底部弹出层是否显示
    
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    onClose(){
      this.setData({
            modalShow: false,
          })
    }

  }
})
