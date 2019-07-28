//index.js
const app = getApp()

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
        isDeletingItemIndex: -1, 
        isDeleting: false,   // 正在删除
        isOver: '亲，账单已经拉到底啦~', // '亲，账单已经拉到底啦~'
        x1: 0,
        x2: 0,
        y1: 0,
        y2: 0,
    },
    onLoad: function () {
        if (app.globalData.openid) {
        this.setData({
            openid: app.globalData.openid
        })
        } else {
            app.getUserOpenIdViaCloud()
            .then(openid => {
                this.setData({
                    openid
                })
                return openid
            }).catch(err => {
                console.error(err)
                wx.showToast({
                    icon: 'none',
                    title: '初始化失败，请检查网络'
                })
            })
        }
        // 获取用户信息
        wx.getSetting({
            success: res => {
                if (res.authSetting['scope.userInfo']) {
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
    },
    onShow: function () {
        this.setData({
            isDeletingItemId: "",
            curMonth: ""
        })
        this.getDetailData();
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

        wx.navigateTo({
            url: '/pages/seeDetail/seeDetail?id=' + id + '&index=' + index
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
            isOver: '',
            detailList: []
        })
        // wx.showLoading({
        //     title: '数据加载中',
        // })
        const db = wx.cloud.database()
        const comm = db.command
        var period = this.getFormatedPeriod(year, month)
        const startTime = period[0]
        const endTime = period[1]
        let detailObj = {}
        var _detailList = []
        let where = {
            _openid: this.data.openid,
            date: comm.lte(endTime).and(comm.gte(startTime))
        }
        db.collection('date_items').where(where).orderBy('date', 'desc').get({
            success: (res) => {
                var dataList = res.data
                // for (var item of dataList) {
                //     _detailList.push(item.items_array)
                // }
                // console.log('_' ,_detailList)
                this.setData({
                    detailList: dataList
                })
            },
            fail: err => {
                wx.showToast({
                    icon: 'none',
                    title: '查询记录失败'
                })
                console.error('[数据库] [查询记录] 失败：', err)
            },
            complete: () => {
            }
        });
        // wx.hideLoading()
        this.setData({
            isOver: '亲，账单已经拉到底啦~'
        });
    },
    // 根据年月来获取当月的时间段
    // 如果不传year/month参数，即获取当前月份的时间段
    getPeriod(year, month){
        let startTime = null
        let endTime = null
        let today = new Date()
        if (!year && !month) {
            var year = today.getFullYear()
            var month = today.getMonth()
            startTime = new Date(year, month, 1)
            endTime = new Date()
        } else {
            startTime = new Date(year, month, 1)
            endTime = new Date(year, month + 1, 0)
        }
        
        return [startTime, endTime]
    },
    // 获取格式化日期日间
    getFormatedPeriod(year, month){
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

        startTime = y + (m > 9 ? m : '0' + m) + '01'
        endTime = y + (m > 9 ? m : '0' + m) + (d > 9 ? d : '0' + d)
        return [startTime, endTime]
        // return [parseInt(startTime), parseInt(endTime)]
    },
    // 获取前一天的日期
    getYesterday(date){
        if (date) {
            var y = date.getFullYear();
            var m = date.getMonth();
            var d = date.getDate() - 1;
            var _date;
            if (d > 0) {
                _date = new Date(y, m, d)
                return _date;
            }
        }
    },
    // 克隆某一天
    // cloneDate(date){
    //     if (date) {
    //         var y = date.getFullYear();
    //         var m = date.getMonth();
    //         var d = date.getDate();
    //         var _date = new Date(y, m, d)
    //         return _date;
    //     }
    // },
    // // 获取该月份最新的一天或者最后一天
    // getLastDay(year, month){
    //     // 先判断是否为本月
    //     var lastDay = null;
    //     var today = new Date();
    //     if (!year && !month) {
    //         return today;
    //     } else if (month == today.getMonth()) {
    //         return today;
    //     } else {
    //         lastDay = new Date(year, month + 1, 0);
    //         return lastDay;
    //     }
    // },
    // 触摸开始
    touchStart(e){
        this.setData({
            x1: e.changedTouches[0].clientX,
            y1: e.changedTouches[0].clientY,
        });
    },
    // 触摸结束
    touchEnd(e){
        let x2 = e.changedTouches[0].clientX;
        let y2 = e.changedTouches[0].clientY;
        console.log('e', e)
        if ((this.data.x1 - x2) > 50 && Math.abs(this.data.y1 - y2) < 50) {
            this.setData({
                isDeletingItemId: e.currentTarget.dataset.id,
                isDeletingItemIndex: e.currentTarget.dataset.index,
            })
        } else if ((this.data.x1 - x2) < -50 && Math.abs(this.data.y1 - y2) < 50) {
            this.setData({
                isDeletingItemId: "",
                isDeletingItemIndex: -1,
            })
        }
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
        let index = e.currentTarget.dataset.index;
        const db = wx.cloud.database();
        const item = db.collection('date_items').doc(_id);
        item.get({
            success: (res) => {
                var arr = res.data.items_array
                arr[index].is_deleted = true;
                item.update({
                    data: {
                        items_array: arr
                    },
                    success: res => {
                        wx.showToast({
                            title: '删除成功'
                        })
                        this.getDetailData()
                    }
                })
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

    onGetOpenid: function() {
        // 调用云函数
        wx.cloud.callFunction({
        name: 'login',
        data: {},
        success: res => {
            console.log('[云函数] [login] user openid: ', res.result.openid)
            app.globalData.openid = res.result.openid
            wx.navigateTo({
            url: '../userConsole/userConsole',
            })
        },
        fail: err => {
            console.error('[云函数] [login] 调用失败', err)
            wx.navigateTo({
            url: '../deployFunctions/deployFunctions',
            })
        }
        })
    },
})
