// pages/addItem/addItem.js
Page({

    /**
     * 页面的初始数据
     */
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
                itemId: options.id,
                itemIndex: parseInt(options.index)
            })
            const db = wx.cloud.database()
            let itemDetail = db.collection('date_items').doc(this.data.itemId).get({
                success: res => {
                    let item = res.data.items_array[this.data.itemIndex]

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
    getFormatedDate(){
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

        return y + m + d;
    },
    // 确认记账，有可能是修改，有可能是新增
    whenConfirm(e){
        if (!e.detail.value) {
            wx.showToast({
                icon: 'none',
                title: '请输入金额'
            })
            return 
        }
        const db = wx.cloud.database()
        const coll = db.collection('date_items')
        let dateKey = this.getFormatedDate()
        if (this.data.itemId) {
            const itemObj = coll.doc(this.data.itemId)
            console.log(12345678)
            itemObj.get({
                success: (res) => {
                    // 未改变日期修改detail
                    if (res.data.date == dateKey) {
                        let arr = res.data.items_array
                        let item = arr[this.data.itemIndex]
                        item.money = parseFloat(e.detail.value),
                        item.date = new Date(this.data.curDate),
                        item.cate = this.data.curSelectedName,
                        item.expense = this.data.curIndex == 0 ? true : false,
                        item.remark = this.data.curRemark,
                        itemObj.update({
                            data: {
                                items_array: arr
                            },
                            success: res => {
                                console.log('同日期修改成功！')
                                wx.switchTab({
                                    url: '/pages/index/index',
                                }),
                                wx.showToast({
                                    title: '修改成功'
                                })
                            }
                        })
                    } else {    // 这里有修改日期
                        let _arr = res.data.items_array
                        _arr[this.data.itemIndex].is_deleted = true
                        console.log('11111111111', _arr)
                        itemObj.update({
                            data: {
                                items_array: _arr
                            }
                        })

                        coll.where({
                            date: dateKey
                        }).get({
                            success: res => {
                                var newItem = {
                                    money: parseFloat(e.detail.value),
                                    date: new Date(this.data.curDate),
                                    cate: this.data.curSelectedName,
                                    expense: this.data.curIndex == 0 ? true : false,
                                    remark: this.data.curRemark,
                                }
                                if (res.data[0]) {
                                    let _id = res.data[0]._id;
                                    let itemsArray = res.data[0]['items_array'];
                                    itemsArray.push(newItem)
                                    coll.doc(_id).update({
                                        data: {
                                            items_array: itemsArray
                                        },
                                        success: () => {
                                            wx.switchTab({
                                                url: '/pages/index/index',
                                            })
                                            wx.showToast({
                                                title: '记账成功',
                                            })
                                        },
                                    })
                                } else {
                                    coll.add({
                                        data: {
                                            date: this.getFormatedDate(),
                                            items_array: [newItem]
                                        },
                                        success: () => {
                                            console.log(1234)
                                            wx.switchTab({
                                                url: '/pages/index/index',
                                            })
                                            wx.showToast({
                                                title: '记账成功',
                                            })
                                        },
                                    })
                                }
                            }
                        })

                    }
                },
                fail: err => {
                    wx.showToast({
                        icon: 'none',
                        title: '修改失败',
                    })
                    console.error('[数据库] [修改记录] 失败：', err)
                },
                complete: () => {
                    this.setData({
                        isDeleting: false
                    })
                }
            })
           
        } else {
            let formatedDate = this.getFormatedDate()
            let newItem = {
                money: parseFloat(e.detail.value),
                date: this.data.curDate ? new Date(this.data.curDate) : new Date(),
                cate: this.data.curSelectedName,
                expense: this.data.curIndex == 0 ? true : false,
                remark: this.data.curRemark,
            }
            coll.where({
                date: formatedDate
            }).get({
                success: res => {
                    if (res.data[0]) {
                        let _id = res.data[0]._id;
                        let itemsArray = res.data[0]['items_array'];
                        itemsArray.push(newItem)
                        coll.doc(_id).update({
                            data: {
                                items_array: itemsArray
                            },
                            success: () => {
                                wx.switchTab({
                                    url: '/pages/index/index',
                                })
                                wx.showToast({
                                    title: '记账成功',
                                })
                            },
                        })
                    } else {
                        coll.add({
                            data: {
                                date: formatedDate,
                                items_array: [newItem]
                            },
                            success: () => {
                                wx.switchTab({
                                    url: '/pages/index/index',
                                })
                                wx.showToast({
                                    title: '记账成功',
                                })
                            },
                        })
                    }
                }
            })
        }
    },
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