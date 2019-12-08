// wx.$curExpense = 0;
// wx.$curIncome = 0;
// 云函数
wx.$getCurData = (openid) => {
  var period = wx.$getFormatedPeriod()
  const startTime = period[0]
  const endTime = period[1]

  wx.cloud.callFunction({
    name: 'getitem',
    data: {
      _openid: openid,
      endTime: endTime,
      startTime: startTime
    },
    success: res => {
      let dataList = res.result.data
      wx.$curExpense = 0;
      wx.$curIncome = 0;
      for (let item of dataList) {
        if (item.expense) {
          wx.$curExpense += item.money;
        } else {
          wx.$curIncome += item.money;
        }
      }

    },
    fail: (err) => {
      console.error('[云函数] [getitem] 调用失败', err);
      return null;
    }
  })
},
// 如果不传year/month参数，即获取当前月份的时间段
wx.$getFormatedPeriod = (year, month) => {
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
  return [startTime, endTime];
},

App({
    globalData: {
      hasLogin: false,
      openid: null
    },
    onLaunch: function () {
      // console.log('只执行一次onlaunch！');
      if (!wx.cloud) {
          console.error('请使用 2.2.3 或以上的基础库以使用云能力')
      } else {
          wx.cloud.init({
            traceUser: true,
            env: "jizhangenv-8sppm"
        })
      }
      // 调用云函数
      wx.cloud.callFunction({
            name: 'login',
            data: {},
          success: res => {
            console.log('[云函数] [login] 调用成功');
            this.globalData.openid = res.result.openid
            wx.$getCurData(this.globalData.openid);
          },
          fail: err => {
            console.error('[云函数] [login] 调用失败', err)
          }
      })
    },
    // lazy loading openid
    // getUserOpenId(callback) {
    //     const self = this

    //     if (self.globalData.openid) {
    //         callback(null, self.globalData.openid)
    //     } else {
    //         wx.login({
    //             success(data) {
    //                 wx.request({
    //                     url: config.openIdUrl,
    //                     data: {
    //                         code: data.code
    //                     },
    //                     success(res) {
    //                         console.log('拉取openid成功', res)
    //                         self.globalData.openid = res.data.openid
    //                         callback(null, self.globalData.openid)
    //                     },
    //                     fail(res) {
    //                         console.log('拉取用户openid失败，将无法正常使用开放接口等服务', res)
    //                         callback(res)
    //                     }
    //                 })
    //             },
    //             fail(err) {
    //                 console.log('wx.login 接口调用失败，将无法正常使用开放接口等服务', err)
    //                 callback(err)
    //             }
    //         })
    //     }
    // },
    // // 通过云函数获取用户 openid，支持回调或 Promise
    // getUserOpenIdViaCloud() {
    //     return wx.cloud.callFunction({
    //         name: 'login',
    //         data: {}
    //     }).then(res => {
    //         this.globalData.openid = res.result.openid
    //         return res.result.openid
    //     })
    // },
})
