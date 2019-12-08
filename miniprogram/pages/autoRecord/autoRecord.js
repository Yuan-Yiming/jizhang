// pages/autoRecord/autoRecord.js
Page({
  data: {
    autoRecordList: [
      {
        cate: '工资',
        money: 6678,
        expense: false,
        remark: '每月工资',
        startDate: '2019-09-28',
        recordGap: 3  // 1: 每天， 2：每周， 3：每月
      },
      {
        cate: '餐饮',
        money: 2.5,
        expense: true,
        remark: '每天早餐',
        startDate: '2019-09-28',
        recordGap: 1  // 1: 每天， 2：每周， 3：每月
      },
    ]
  },

  // 获取数据

  // 添加记录
  addRecord() {
    wx.navigateTo({
      url: '/pages/addAutoRecord/addAutoRecord',
    })
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
})