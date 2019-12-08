// pages/addBudget/addBudget.js

const db = wx.cloud.database()
const budget = db.collection('budget')

Page({
  data: {
    budget: 0,
    expend: 3000,
    remain: 0,
    percent: '',
    remainIsMinus: true,
    isEditing: false,
    curValue: ''   // 输入框的钱
  },

  // 页面首次加载
  onLoad: function (options) {
    this.getData()
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

      this.getData()
    }).catch(err => {
      console.error('查询失败：', err)
    })
  },

  // 获取数据
  getData() {
    this.setData({
      expend: wx.$curExpense.toFixed(2),
      remain: wx.$myRemain.toFixed(2)
    })
    if (wx.$myBudget) {
      this.setData({
        budget: wx.$myBudget.toFixed(2),
        curValue: wx.$myBudget.toFixed(2),
        percent: (() => {
          let temp = wx.$myRemain / wx.$myBudget;
          if (wx.$myRemain > 0) {
            return temp * 100 + '%';
          } else if (temp > -1) {
            return (1 + temp) * 100 + '%';
          } else {
            return '0';
          }
        })(),
        remainIsMinus: wx.$myRemain < 0 ? true : false
      })
    }
  },

  // 编辑预算按钮
  editBudget: function () {
    this.setData({
      isEditing: true
    })
  },

  // 确认，有可能是修改，有可能是新增
  whenConfirm(e) {
    if (!e.detail.value) {
      wx.showToast({
        icon: 'none',
        title: '请输入金额'
      })
      return
    } else {
      budget.get()
      .then(res => {
        if (res.data.length === 0) {
          db.collection('budget').add({
            data: {
              money: e.detail.value
            }
          }).then(res => {
            wx.showToast({
              title: '添加成功！'
            })
            this.setData({
              isEditing: false,
              // budget: e.detail.value
            })
            this.getBudget()
          }).catch(err => {
            console.error('添加预算失败:', err)
          })
        } else {
          budget.doc(res.data[0]._id).update({
            data: {
              money: e.detail.value
            }
          }).then(res => {
            wx.showToast({
              title: '更新成功！',
            })
            this.setData({
              isEditing: false,
              // curValue: e.detail.value,
              // budget: e.detail.value
            })
            this.getBudget()
          }).catch(err => {
            console.error('更新预算失败：', err)
          })
        }
      })
      .catch(err => {
        console.log(err)
      })
    }
  },

  // 当输入时检查输入内容是否为符合规定的数字
  whenInput(e) {
    // event.detail = { value, cursor, keyCode },
    var keyCode = e.detail.keyCode;
    var value = e.detail.value;
    // 判断小数点不多于2位
    var valueToList = value.split('.');
    // 判断当前输入键值是否符合内容要求：0-9 or 小数点
    if ((keyCode != 8) && (keyCode < 46 || keyCode > 57 || keyCode == 47)) {
      return this.data.curValue;
    } else if (valueToList.length > 2) {
      return this.data.curValue;
    } else if (valueToList[1] && valueToList[1].length > 2) {
      return this.data.curValue;
    } else {
      this.setData({
        curValue: value
      })
    }
  },

  // =============== 获取数据 ================
  // 根据年份和月份加载数据
  // 如果不传year/month参数，即获取当前月份的数据
  getDetailData(year, month) {
    this.setData({
      isOverText: '',
      detailList: []
    })
    const db = wx.cloud.database()
    const comm = db.command
    var period = this.getFormatedPeriod(year, month)
    const startTime = period[0]
    const endTime = period[1]
    // let where = {
    //     _openid: this.data.openid,
    //     date_str: comm.lte(endTime).and(comm.gte(startTime))
    // }
    // 调用云函数
    if (!this.data.openid) {
      this.onGetOpenid(endTime, startTime);
    } else {
      let openid = this.data.openid
      this.getDataByCloud(openid, endTime, startTime);
    }

  },

  // 云函数
  getDataByCloud(openid, endTime, startTime) {
    wx.showLoading({
      title: '加载中',
    })
    wx.cloud.callFunction({
      name: 'getitem',
      data: {
        _openid: openid,
        endTime: endTime,
        startTime: startTime
      },
      success: res => {
        console.log('[云函数] [getitem] 调用成功')
        let data = res.result.data
        let _dataList = []
        for (let item of data) {
          let len = _dataList.length
          let last_date_str = len > 0 ? _dataList[len - 1][0].date_str : ''
          if (last_date_str && item.date_str == last_date_str) {
            _dataList[len - 1].push(item)
          } else {
            _dataList[len] = [item]
          }
        }
        this.setData({
          detailList: _dataList
        })
      },
      fail: (err) => {
        console.error('[云函数] [getitem] 调用失败', err)
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
      },
      complete: () => {
        wx.hideLoading()
        this.setData({
          isOverText: '亲，账单已经拉到底啦~'
        });
      }
    })
  },
  // 根据年月来获取当月的时间段
  // 如果不传year/month参数，即获取当前月份的时间段
  // 获取格式化日期日间
  getFormatedPeriod(year, month) {
    let startTime = 0
    let endTime = 0
    let today = new Date()
    let y, m, d
    if (!year && !month) {
      y = today.getFullYear()
      m = today.getMonth() + 1
      d = today.getDate()
    } else {
      let lastDay = new Date(year, month + 1, 0)
      y = year
      m = month + 1
      d = lastDay.getDate()
    }

    startTime = '' + y + (m > 9 ? m : '0' + m) + '01'
    endTime = '' + y + (m > 9 ? m : '0' + m) + (d > 9 ? d : '0' + d)
    return [startTime, endTime]
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