// pages/addItem/addItem.js
const app = getApp()

Page({
    data: {
        curIndex: 0,
        expenseIcons: [
        ],
        incomeIcons: [
        ],
        curValue: '',
        curSelectedIcon: 'canyin',
        curSelectedName: '餐饮',
        curDate: '',   // 当前选中时间
        curRemark: '',   // 当前备注内容
        isAddingRemark: false,
        itemId: null,
        itemIndex: null
    },
    onLoad: function (options) {
        if (options.id) {
            this.setData({
                itemId: options.id
            })
            const db = wx.cloud.database()
            let itemDetail = db.collection('jizhang_item').doc(this.data.itemId).get({
                success: res => {
                    let item = res.data

                    this.setData({
                        curSelectedName: item.cate,
                        curIndex: item.expense ? 0 : 1,
                        curRemark: item.remark,
                        curValue: item.money.toFixed(2),
                        curDate: this.formatDate(item.date),
                    })

                },
                fail: err => {

                },
                complete: () => {

                }
            })
        }
        
    },
    // 格式化时间
    formatDate: date => {
        let y = date.getFullYear()
        let m = date.getMonth() + 1
        let d = date.getDate()

        return y + '-' + (m > 9 ? m : '0' + m) + '-' + (d > 9 ? d : '0' + d)
    },
    // 添加备注
    toAddItem() {
        this.setData({
            isAddingRemark: true
        })
    },
    // 添加备注输入框失去焦点
    whenRemarkBlur(e){
        this.setData({
            curRemark: e.detail.value,
            isAddingRemark: false
        })
    },
    // 添加备注输入框获得焦点
    whenRemarkFocus(e) {
    },
    // 选中日期
    bindDateChange(e){
        this.setData({
            curDate: e.detail.value
        });
    },
    // 选择记账分类--支出/收入
    selectType(e){
        this.setData({
            curIndex: e.currentTarget.dataset.index,
        });
        if (this.data.curIndex == 0) {
            this.setData({
                curSelectedIcon: 'canyin',
                curSelectedName: '餐饮'
            });
        } else {
            this.setData({
                curSelectedIcon: 'gongzi',
                curSelectedName: '工资'
            });
        }
    },
    // 选择记账类型 
    selectCate(e){
        this.setData({
            curSelectedIcon: e.currentTarget.dataset.cate,
            curSelectedName: e.currentTarget.dataset.name 
        });
    },
    // 加载记账类型图标
    getIcons(){
        const db = wx.cloud.database()
        db.collection('category').where({
            expense: true
        }).get({
            success: res => {
                this.setData({
                    expenseIcons: res.data
                });
            }
        })
        db.collection('category').where({
            expense: false
        }).get({
            success: res => {
                this.setData({
                    incomeIcons: res.data
                });
            }
        })
    },
    // 格式化日期 -- '20190713'
    getFormatedDate(date){
        var date, y, m, d;
        if (this.data.curDate) {
            date = new Date(this.data.curDate);
        } else {
            date = new Date();
        }
        y = date.getFullYear();
        m = date.getMonth() + 1;
        d = date.getDate();

        m = m > 9 ? m : '0' + m;
        d = d > 9 ? d : '0' + d;
        return ('' + y + m + d);
    },
    // 确认记账，有可能是修改，有可能是新增
    whenConfirm(e){
        if (!e.detail.value) {
            wx.showToast({
                icon: 'none',
                title: '请输入金额'
            })
            return 
        } else if (this.data.itemId) {
            this.editItem(this.data.itemId, e)
        } else {
            this.creatItem(e)
        }
    },
    // 新增一个item
    creatItem(e) {
        const db = wx.cloud.database()
        const coll = db.collection('jizhang_item')
        coll.add({
            data: {
                money: parseFloat(e.detail.value),
                date: this.data.curDate ? new Date(this.data.curDate) : new Date(),
                date_str: this.getFormatedDate(),
                cate: this.data.curSelectedName,
                expense: this.data.curIndex == 0 ? true : false,
                remark: this.data.curRemark,
            },
            success: () => {
              wx.reLaunch({
                  url: '/pages/index/index'
              })
              wx.showToast({
                  title: '记账成功!',
              })
              wx.$getCurData(app.globalData.openid);
            },
            fail: err => {
                wx.showToast({
                    icon: 'none',
                    title: '记账失败',
                })
                console.error('[数据库] [增加记录] 失败：', err)
            },
            complete: () => {}
        })
    },
    // 修改一个item
    editItem(id, e) {
        const db = wx.cloud.database()
        const coll = db.collection('jizhang_item')
        const item = coll.doc(id)
        if (item) {
            item.get({
                success: res => {
                    item.update({
                        data: {
                          money: parseFloat(e.detail.value),
                          date: new Date(this.data.curDate),
                          date_str: this.getFormatedDate(),
                          cate: this.data.curSelectedName,
                          expense: this.data.curIndex == 0 ? true : false,
                          remark: this.data.curRemark,
                        },
                        success: res => {
                          wx.reLaunch({
                              url: '/pages/index/index'
                          }),
                          wx.showToast({
                              title: '修改成功'
                          })
                          wx.$getCurData(app.globalData.openid);
                        },
                        fail: err => {
                          wx.showToast({
                              icon: 'none',
                              title: '修改失败',
                          })
                          console.error('[数据库] [修改记录] 失败：', err)
                        },
                        complete: () => {}
                    })
                },
                fail: err => {
                  wx.showToast({
                      icon: 'none',
                      title: '修改失败',
                  })
                  console.error('[数据库] [修改记录] 失败：', err)
                },
                complete: () => {}
            })
        }},

    // 当输入时检查输入内容是否为符合规定的数字
    whenInput(e){
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
    // 当聚焦时输入框时
    whenFocus(e){

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
        this.getIcons();
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