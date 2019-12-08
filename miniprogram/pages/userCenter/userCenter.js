const app = getApp()
const db = wx.cloud.database()
const _ = db.command
const budget = db.collection('budget')
const jizhang = db.collection('jizhang_item')

wx.$myBudget = 0
wx.$myRemain = null

Page({
  data: {
    requestResult: '',
    version: 'v1.0.2',
    recordTimes: 0,
    messageNum: 3,
    isAddingBudget: true,
    remain: 0,
    remainIsMinus: false   // 预算超标 
  },

  // 转发小程序的参数
  onShareAppMessage() {
    return {
      title: '发现了一个好用的记账工具！',
      path: '/pages/index/index',
      imageUrl: '../../images/logo.png',
    };
  },

  // 未上线
  toMyWallet() {
    wx.showToast({
      title: '该功能未上线！',
      icon: 'none',
      duration: 800
    })
  },

  // 跳转到添加某个页面
  navigateTo: function (e) {
    let page = e.currentTarget.dataset.page;
    wx.navigateTo({
      url: '/pages/' + page + '/' + page,
    })
  },
  
  // 获取预算
  getBudget: function () {
    budget.get().then(res => {
      if (res.data.length === 0) {
        wx.$myBudget = '未设置'
        wx.$myRemain = '未设置'
      } else {
        let money = parseFloat(res.data[0].money)
        wx.$myBudget = money;
        wx.$myRemain = wx.$myBudget - wx.$curExpense;
      }
      this.setData({
        remain: (wx.$myRemain).toFixed(2),
        remainIsMinus: wx.$myRemain > 0 ? false : true
      })
    }).catch(err => {
      console.error('查询失败：', err)
    })
  },

  // 获取记账次数
  getRecordTimes() {
    let period = wx.$getFormatedPeriod()
    let start = period[0]
    let end = period[1]
    jizhang.where(
      {
        date_str: _.gte(start).and(_.lte(end))
      }
    ).count()
    .then(res => {
      this.setData({
        recordTimes: res.total
      })
    })
    .catch(err => {
      console.error(err)
    })
  },

  // 页面加载时调用？
  onLoad: function () {
  },
  onShow: function () {
    this.getBudget();
    this.getRecordTimes();
  },

})
