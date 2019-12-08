// 引入echart
import * as echarts from '../../ec-canvas/echarts';

const app = getApp();

function initChartPie(canvas, width, height) {
    const chart = echarts.init(canvas, null, {
        width: width,
        height: height
    });
    canvas.setChart(chart);

    var option1 = {
      // backgroundColor: "#ffffff",
      color: ["#41C5AD", "#37A2DA", "#32C5E9", "#67E0E3", "#91F2DE", "#FFDB5C", "#FF9F7F"],
        series: [{
            label: {
                fontSize: 12,
                rich: {}
            },
            type: 'pie',
            center: ['50%', '50%'],
            radius: [0, '60%'],
            data: [{
                value: 55,
                name: '餐饮'
            }, {
                value: 20,
                name: '购物'
            }, {
                value: 10,
                name: '零食'
            }, {
                value: 20,
                name: '水果'
            }, {
                value: 38,
                name: '交通'
            },
            ],
            itemStyle: {
                emphasis: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 2, 2, 0.3)'
                }
            }
        }]
    };
    chart.setOption(option1);
    
    return chart;
}

Page({
  data: {
    _index: 1,
    ec1: {},
    ec2: {},
    curDate: '',
    year: '',
    month: '',
    startTime: '',
    endTime: '',
    rowData: [],
    cateArray: [],
    detailList: [],   // 请求得到的数据列表
    lineChart: null,
    pieChart: null,
    dateNumber: 30,
    lineDataY: [],
    lineDataX: ['01','02','03','04','05','06','07','08','09','10','11','12','13','14', '15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31'],
    iconDict: []
  },

  onLoad: function () {
    this.getIconDict();
  },
  onShow: function () {
    this.getLineChartData();
  },

  // 选择图表类型，不请求数据
  selectChartType(e) {
    let _index = e.currentTarget.dataset.index;
    if (this.data._index != _index) {
      this.setData({
        _index: _index,
      })
      this.getLineDataY();
    }
  },

  // 选择查看月份，请求数据
  bindMonthChange(e) {
    let dateValue = e.detail.value;
    this.setData({curDate: e.detail.value});
    let y = dateValue.slice(0, 4);
    let m = dateValue.slice(5);
    if (this.data.year == y && this.data.month == m) {
      return ;
    } else {
      let _dateNumber = this.getDaysOfMonth(dateValue.slice(0, 4), dateValue.slice(5));
      this.setData({
        curDate: dateValue,
        year: dateValue.slice(0, 4),
        month: dateValue.slice(5),
        dateNumber: _dateNumber
      })
      
      this.getLineChartData();
    }
    // this.getLineDataY();
    // this.resetLineChart();
  },

  // 根据年月获取该月有多少天，y、m为int或str
  getDaysOfMonth(year, month) {
    let y = parseInt(year);
    let m = parseInt(month);
    let d = new Date(y, m, 0).getDate();
    return d;
  },

  // 根据年份和月份加载数据
  getLineChartData() {
    let year, month;
    if (this.data.year) {
      year = this.data.year;
    } else {
      year = '';
    }
    if (this.data.month) {
      month = this.data.month - 1;
    } else {
      month = '';
    }
    this.setData({
      detailList: []
    })
    const db = wx.cloud.database()
    const comm = db.command
    var period = this.getFormatedPeriod(year, month)
    // const startTime = period[0]
    const endTime = period[1]

    this.setData({
      startTime: period[0],
      endTime: period[1]
    })

    // 调用云函数
    this.getDataByCloud();
  },

  // 云函数，请求数据
  getDataByCloud() {
    let openid = app.globalData.openid;
    let startTime = this.data.startTime;
    let endTime = this.data.endTime;

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
        let data = res.result.data // 原始请求数据
        // this.data.rowData = res.result.data
        this.sortData(res.result.data);
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
          detailList: _dataList.reverse()
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
        wx.hideLoading();
        console.log(this.data.detailList);
        this.getLineDataY();
      }
    })
  },
  
  // 将数据按类别分好
  sortData(rowData) {
    let cateObj = {};
    let cateArr = [];
    for (let item of rowData) {
      let cate = item.cate; 
      if (!cateObj.hasOwnProperty(cate)) {
        cateObj[cate] = [];
      }
      cateObj[cate].push(item);
    }
    for (let key in cateObj) {
      let cateItem = {};
      let cateList = cateObj[key]; 
      let name = key;  // 该类别名称
      let number = cateList.length;  // 该类别记账条数
      let total = this.calcCateMoney(cateList);  // 该类别记账总金额
      let expense = cateList[0].expense;   // 该类别是否为支出项目
      let icon = this.data.iconDict[key].py_name;   // 获取类别icon标记标签名py_name
      cateItem = {
        name: name,
        number: number,
        total: total,
        expense: expense,
        icon: icon
      }
      cateArr.push(cateItem);
    }
    cateArr.sort(function (a, b) {
      var _a = parseFloat(a.total);
      var _b = parseFloat(b.total);
      if (_a > _b) {
        return -1;
      } else {
        return 1;
      }
    })
    // console.log('cateArr2', cateArr);
    this.setData({
      cateArray: cateArr
    })
  },

  // 获取icon列表
  getIconDict() {
    const db = wx.cloud.database();
    db.collection('category').get({
      success: res => {
        let _obj = {};
        for (let item of res.data) {
          _obj[item.name] = item
        }
        this.setData({
          iconDict: _obj
        });
      }
    })
  },

  // 计算该类别账单的金额数，参数为该类别所有项目的列表
  calcCateMoney(cateList) {
    let count = 0;
    for (let item of cateList) {
      count += item.money;
    }
    return count.toFixed(2);
  },

  // 计算当天结余，参数为array
  calcBalance(array, index) {
    var count = 0;
    if (this.data._index == 1) {
      for (var item of array) {
        if (item.expense) {
          count += item.money;
        }
      }
    } else if (this.data._index == 2) {
      for (var item of array) {
        if (!item.expense) {
          count += item.money;
        }
      }
    }
    return count;
  },

  // 获取Y轴数据，返回Array
  getLineDataY() {
    let data = [];
    if (this.data.detailList.length == 0) {
      let len = this.data.dateNumber;
      for (let i = 0; i < len; i ++) {
        data.push(0);
      }
    } else {
      let _dateStr = this.data.detailList[0][0].date_str;  // 当月数组的第一天,"20190903"
      let dateStr = parseInt(_dateStr.slice(6));    // 检查是否从1号开始, 3
      // 如果不是从1号开始，把前面的数据补充完整
      if (dateStr != 1) {
        for (var i = 1; i < dateStr; i ++) {
          data.push(0);
        }
      }
      for (var item of this.data.detailList) {
        let _str = parseInt(item[0].date_str.slice(6));
        if (_str - dateStr > 1) {
          for (var i = 1; i < (_str - dateStr); i++) {
            data.push(0);
          }
        }
        dateStr = _str;
        let count = this.calcBalance(item);
        data.push(count);
      }
    }
    this.setData({
      lineDataY: data
    })
    this.resetLineChart();
  },

  // 根据年月来获取当月的时间段
  // 如果不传year/month参数，参数格式为int，即获取当前月份的时间段
  // 获取格式化日期日间
  getFormatedPeriod(year, month) {
    let startTime = 0
    let endTime = 0
    let today = new Date()
    let y, m, d, _dateNumber
    if (!year && !month) {
      y = today.getFullYear()
      m = today.getMonth() + 1
      d = today.getDate()
      _dateNumber = this.getDaysOfMonth(y, m)
      this.setData({
        year: y,
        month: m,
        dateNumber: _dateNumber
      })
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

  initEchartPie(e) {
    initChartPie(e.detail.canvas, e.detail.width, e.detail.height);
  },

  initEchartLine(e) {
    this.initChartLine(e.detail.canvas, e.detail.width, e.detail.height);
  },

  // 初始化echart，将chart对象保存在全局变量中
  initChartLine(canvas, width, height, _index, dataX, dataY) {
    const chart = echarts.init(canvas, null, {
      width: width,
      height: height
    });
    canvas.setChart(chart);

    this.data.lineChart = chart;   // 在全局变量中保存chart对象

  },

  // 重置lineChart
  resetLineChart() {
    console.log('???');
    var option = {
      color: this.data._index == 2 ? ["#cc3333"] : ["#41C5AD"],
      grid: {
        containLabel: true,
        left: 16,
        right: 30,
        top: 20,
        bottom: 40,
      },
      tooltip: {
        show: true,
        trigger: 'axis'
      },
      xAxis: {
        name: '（日）',
        nameGap: 0,
        nameTextStyle: {
          padding: [26, 10, 0, 0],
          // backgroundColor: 'red'
        },
        type: 'category',
        boundaryGap: false,
        data: this.data.lineDataX.slice(0, this.data.dateNumber),
        axisLabel: {
          textStyle: {
            fontSize: 12,
          },
        },
      },
      yAxis: {
        name: '（元）',
        nameGap: 8,
        nameTextStyle: {
          padding: [10, 26, 0, 0],
          // backgroundColor: 'red'
        },
        // x: 'center',
        type: 'value',
        splitLine: {
          lineStyle: {
            type: 'dashed'
          }
        },
        axisLabel: {
          textStyle: {
            fontSize: 12
          }
        }
      },
      series: [{
        name: 'A',
        type: 'line',
        smooth: true,
        data: this.data.lineDataY
      }]
    };
    this.data.lineChart.setOption(option);
  }

});
