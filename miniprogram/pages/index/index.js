//index.js
const app = getApp()
wx.$getFormatedPeriod = function(year, month){
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
}

Page({
    data: {
        opemid: '',
        avatarUrl: './user-unlogin.png',
        userInfo: {},
        logged: false,
        takeSession: false,
        requestResult: '',
        expense: 2398.00, 
        income: 5300.01,
        curIndex: 0,
        curMonth: '',
        detailList: [],   // 当前账单详情列表
        isDeletingItemId: "", // 将要被删除项目的id
        isDeleting: false,   // 正在删除
        isOverText: '亲，账单已经拉到底啦~',
        x1: 0,
        x2: 0,
        y1: 0,
        y2: 0,
        needRefresh: false,
        isTouching: false
    },
    onLoad: function () {
        this.getDetailData()
        // 获取用户信息
      wx.authorize({
        scope: 'scope.userInfo',
        success() {
          wx.getUserInfo({
            success: res => {
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo,
              })
            }
          })
        }
      })
        wx.getSetting({
            success: res => {
                console.log(res)
                if (!res.authSetting['scope.userInfo']) {
                  wx.authorize({
                    scope: 'scope.userInfo',
                    success() {
                      wx.getUserInfo({
                        success: res => {
                          this.setData({
                            avatarUrl: res.userInfo.avatarUrl,
                            userInfo: res.userInfo,
                          })
                        },
                      })
                    },
                    fail: err => {
                      console.error(err)
                    }
                  })
                } else {
                  // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                  wx.getUserInfo({
                    success: res => {
                      this.setData({
                        avatarUrl: res.userInfo.avatarUrl,
                        userInfo: res.userInfo,
                      })
                    }
                  })
                }
            }
        })
        // wx.getSetting({
        //   success(res) {
        //     if (!res.authSetting['scope.record']) {
        //       wx.authorize({
        //         scope: 'scope.record',
        //         success() {
        //           // 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问
        //           wx.startRecord()
        //         }
        //       })
        //     }
        //   }
        // })
    },
    onShow: function () {
        this.setData({
            isDeletingItemId: "",
            curMonth: ""
        })
    },
    // 选择查看月份
    bindMonthChange(e){
        var y, m;
        this.setData({
            isDeletingItemId: "",
        })
        this.setData({
            curMonth: e.detail.value
        })
        y = this.data.curMonth.slice(0, 4);
        m = this.data.curMonth.slice(5);
        this.getDetailData(y, m - 1);
    },
    // 跳转到添加账单页面
    toAddItem: function () {
        wx.navigateTo({
            url: '/pages/addItem/addItem',
        })
    },
    // 跳转到详情页面
    toSeeDetail: function (e) {
        let id = e.currentTarget.dataset.id
        let index = e.currentTarget.dataset.index

        this.setData({
          isDeletingItemId: id
        });
        wx.navigateTo({
            url: '/pages/seeDetail/seeDetail?id=' + id
        })
    },
    // 选择账单查看类型
    selectType(e){
        this.setData({
            curIndex: e.currentTarget.dataset.index,
        });
        this.setData({
            isDeletingItemId: "",
        })
    },

    // 根据年份和月份加载数据
    // index 必选参数
    // 如果不传year/month参数，即获取当前月份的数据
    getDetailData(year, month){
        this.setData({
            isOverText: '',
            detailList: []
        })
        const db = wx.cloud.database()
        const comm = db.command
        var period = wx.$getFormatedPeriod(year, month)
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
    getDataByCloud(openid, endTime, startTime){
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
    
    // 触摸开始
    touchStart(e){
        return;
        this.setData({
            // x1: e.changedTouches[0].clientX,
            // y1: e.changedTouches[0].clientY,
            isTouching: true,
            isDeletingItemId: e.currentTarget.dataset.id
        });
        
    },
    // 触摸结束
    touchEnd(e){
       this.setData({
         
       });
       setTimeout(() => {
         this.setData({
           isTouching: false,
           isDeletingItemId: ""
         });
       }, 100);

      //  原本删除事件
        // let x2 = e.changedTouches[0].clientX;
        // let y2 = e.changedTouches[0].clientY;
        // if ((this.data.x1 - x2) > 50 && Math.abs(this.data.y1 - y2) < 50) {
        //     this.setData({
        //         isDeletingItemId: e.currentTarget.dataset.id
        //     })
        // } else if ((this.data.x1 - x2) < -50 && Math.abs(this.data.y1 - y2) < 50) {
        //     this.setData({
        //         isDeletingItemId: ""
        //     })
        // }
    },
    // 删除账单
    delItem(e){
        if (this.data.isDeleting) {
            return
        }
        this.setData({
            isDeleting: true
        });
        let _id = e.currentTarget.dataset.id;
        const db = wx.cloud.database();
        const item = db.collection('jizhang_item').doc(_id);
        item.remove({
            success: (res) => {
                wx.showToast({
                    title: '删除成功'
                })
                this.getDetailData()
                wx.$getCurData(app.globalData.openid)
            },
            fail: err => {
                wx.showToast({
                    icon: 'none',
                    title: '删除失败',
                })
                console.error('[数据库] [删除记录] 失败：', err)
            },
            complete: () => {
                this.setData({ isDeleting: false })
            }
        })
    },

    onGetUserInfo: function(e) {
        if (!this.logged && e.detail.userInfo) {
        this.setData({
            logged: true,
            avatarUrl: e.detail.userInfo.avatarUrl,
            userInfo: e.detail.userInfo
        })
        }
    },

    onGetOpenid: function(endTime, startTime) {
        // 调用云函数
        wx.cloud.callFunction({
            name: 'login',
            data: {},
            success: res => {
                app.globalData.openid = res.result.openid
                this.setData({
                    openid: app.globalData.openid
                })
                // 获取数据
                let openid = this.data.openid
                this.getDataByCloud(openid, endTime, startTime)
            },
            fail: err => {
                console.error('[云函数] [login] 调用失败', err)
                wx.showToast({
                    icon: 'none',
                    title: '初始化失败，请检查网络'
                })
            }
        })
    },
})
