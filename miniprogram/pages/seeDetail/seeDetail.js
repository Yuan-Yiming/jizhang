// miniprogram/pages/seeDetail/seeDetail.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        id: -1,
        index: -1,
        cate: '',
        rowMoney: 0,
        money: 0,
        type: '支出',
        date: '',
        remark: '',
        isDeleting: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            id: options.id,
            index: parseInt(options.index)
        })
        const db = wx.cloud.database()
        const itemDetail = db.collection('date_items').doc(this.data.id).get({
            success: res => {
                let item = res.data.items_array[this.data.index]

                this.setData({
                    cate: item.cate,
                    type: (item.expense ? '支出' : '收入') + '/' + item.cate,
                    rowMoney: item.money.toFixed(2),
                    money: (item.expense ? '-' : '+') + item.money.toFixed(2),
                    date: this.formatDate(item.date),
                    remark: item.remark
                })
            },
            fail: err => {

            },
            complete: () => {

            }
        })
    },
    // 格式化时间
    formatDate: date => {
        let y = date.getFullYear()
        let m = date.getMonth() + 1
        let d = date.getDate() 

        return y + '-' + (m > 9 ? m : '0' + m) + '-' + (d > 9 ? d : '0' + d) 
    },
    // 跳转到添加账单页面
    toEditItem: function () {
        wx.navigateTo({
            url: '/pages/addItem/addItem?' + 'id=' + this.data.id + '&index=' + this.data.index,
        })
    },
    // 删除内容
    deleteItem() {
        if (this.data.isDeleting) {
            return
        }
        this.setData({
            isDeleting: true
        })
        const db = wx.cloud.database();
        const item = db.collection('date_items').doc(this.data.id);
        item.get({
            success: (res) => {
                var arr = res.data.items_array
                arr[this.data.index].is_deleted = true;
                item.update({
                    data: {
                        items_array: arr
                    },
                    success: res => {
                        wx.switchTab({
                            url: '/pages/index/index',
                        }),
                        wx.showToast({
                            title: '删除成功'
                        })
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
                this.setData({
                    isDeleting: false
                })
            }
        })
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