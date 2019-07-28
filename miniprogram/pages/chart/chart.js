import * as echarts from '../../ec-canvas/echarts';

const app = getApp();

function initChart1(canvas, width, height) {
    const chart = echarts.init(canvas, null, {
        width: width,
        height: height
    });
    canvas.setChart(chart);

    var option1 = {
        backgroundColor: "#ffffff",
        color: ["#37A2DA", "#32C5E9", "#67E0E3", "#91F2DE", "#FFDB5C", "#FF9F7F"],
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
function initChart2(canvas, width, height) {
    const chart = echarts.init(canvas, null, {
        width: width,
        height: height
    });
    canvas.setChart(chart);

    var option2 = {
        color: ["#37A2DA", "#67E0E3", "#9FE6B8"],
        grid: {
            containLabel: true
        },
        
        tooltip: {
            show: true,
            trigger: 'axis'
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: ['01日', '02日', '03日', '04日', '05日', '06日', '07日', '08日', '09日', '10日', '11日', '12日', '13日', '14日', '15日', '16日', '17日', '18日', '19日', '20日', '21日', '22日', '23日', '24日', '25日', '26日', '27日', '28日', '29日', '30日',],
            //  改变x轴颜色
            // axisLine: {
            //     lineStyle: {
            //         color: '#2A5D75',
            //     }
            // },
            //  改变x轴字体颜色和大小  
            axisLabel: {
                textStyle: {
                    fontSize: 12,
                },
            },
        },
        yAxis: {
            x: 'center',
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
            // smooth: true,
            data: [18, 36, 65, 30, 78, 40, 33, 18, 36, 65, 30, 78, 40, 33, 18, 36, 65, 30, 78, 40, 33,18, 36, 65, 30, 78, 40, 33,23,45]
        }]
    };

    chart.setOption(option2);

    return chart;
}

Page({
    data: {
        canvas: null,
        width: 0,
        height: 0,
        _index: 1,
        ec1: {},
        ec2: {},
        curMonth: ''
    },

    // 选择图表类型
    selectChartType(e) {
        this.setData({
            _index: e.currentTarget.dataset.index,
        })
    },

    onReady() {
    },

    echartInit1(e) {
        this.setData({
            canvas: e.detail.canvas,
            width: e.detail.width,
            height: e.detail.height
        })
        initChart1(this.data.canvas, this.data.width, this.data.height);
    },
    echartInit2(e) {
        this.setData({
            canvas: e.detail.canvas,
            width: e.detail.width,
            height: e.detail.height
        })
        initChart2(this.data.canvas, this.data.width, this.data.height);
    }
});
