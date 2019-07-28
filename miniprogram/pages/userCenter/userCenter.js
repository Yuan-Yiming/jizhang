//index.js
const app = getApp()

Page({
  data: {
    userAvatarUrl: '',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
    username: '大明',
    usingInfo: [
      {
        item: '已连续打卡',
        num: 3
      },
      {
        item: '总记账天数',
        num: 12
      },
      {
        item: '总记账笔数',
        num: 24
      }
    ]
  },

  // 页面加载时调用？
  onLoad: function () {
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }
  },
    onShow: function () {
        
    },
  // onGetOpenid: function () {
  //   // 调用云函数
  //   wx.cloud.callFunction({
  //     name: 'login',
  //     data: {},
  //     success: res => {
  //       // console.log(res)
  //       app.globalData.openid = res.result.openid
  //       wx.navigateTo({
  //         url: '../userConsole/userConsole',
  //       })
  //     },
  //     fail: err => {
  //       console.error('[云函数] [login] 调用失败', err)
  //       wx.navigateTo({
  //         url: '../deployFunctions/deployFunctions',
  //       })
  //     }
  //   })
  // },

  // 上传图片
  uploadAvatar: function () {
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        wx.showLoading({
          title: '头像上传中',
        })
        // console.log(res);
        const filePath = res.tempFilePaths[0]
        // 上传图片
        const cloudPath = app.globalData.openid + filePath.match(/\.[^.]+?$/)[0]
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            console.log('[上传文件] 成功：', res)
            
            app.globalData.avatarFile = res.fileID
            app.globalData.cloudPath = cloudPath
            app.globalData.imagePath = filePath

            this.setData({ userAvatarUrl: app.globalData.avatarFile })
          },
          fail: e => {
            console.error('[上传文件] 失败：', e)
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          },
          complete: () => {
            wx.hideLoading()
          }
        })
        

      },
      fail: e => {
        console.error(e)
      }
    })
  },

})
