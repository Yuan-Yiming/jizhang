Page({
  data: {
    settingIndex: 0,
    typeIndex: 0, // 0支出，2收入
    typeArray: ['支出', '收入'],
    cateIndex: 0,
    cateArray: ['餐饮', '水果', '饮料'],
    money: '00.00',
    period: 3, // 0未设置 ，1每天，2每周，3每月
    periodArray: ['每天', '每周', '每月'],
    startTime: '20191002',
    endTime: '未设置',
    remark: '每月工资'
  },

  // 选择收支类型
  setting(e) {
    let index = e.currentTarget.dataset.index
    this.setData({
      settingIndex: index
    })
  },

  // 选择收支类型
  bindChangeType(e) {
    this.setData({
      typeIndex: e.detail.value
    })
  },

  // 选择记账类别
  bindChangeCate(e) {
    this.setData({
      cateIndex: e.detail.value
    })
  },

  // 检查表单内容
  checkForm() {

  },

  // 保存设置
  saveSetting() {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})