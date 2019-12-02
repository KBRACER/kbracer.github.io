$(function () {

  var jsonData
  function setTable(arr) {
    var htmlStr = template('tb', {
      data: arr
    })
    $("#tb_results > tbody").html(htmlStr)
  }

  template.defaults.imports.timeFormat = function (date) {
    var timeArr = date.split('.'),
      sec = timeArr[0] % 60,
      min
    timeArr[0] >= 60 ? min = 1 : min = 0
    sec < 10 ? sec = '0' + sec : null
    return `${min}:${sec}.${timeArr[1]}`
  }
  //获取json数据
  $.ajax({
    url: './speed.json?v=201912010001',
    async: false,
    success: function (res) {
      // console.log(res);
      jsonData = res
    }
  })
  setTable(jsonData)

  //选择级别
  $('#lv').on('change',function(){
    var lv = $(this).val(),
    arr

    if(lv == 'all'){
      setTable(jsonData)
    }else{
      arr = jsonData.filter(function(v){
        return v.lv == lv
      })
      setTable(arr)
    }

  })

  //搜索车型
  $('#search').on('input',function(){
    var val = $(this).val().toLowerCase()
    var arr = jsonData.filter( v => {
      return v.car.toLowerCase().indexOf(val) != -1
    })
    setTable(arr)
  })

  console.log('%c键盘车神教', "text-shadow:0 1px 0 #ccc,0 2px 0 #c9c9c9,0 3px 0 #bbb, 0 4px 0 #b9b9b9,0 5px 0 #aaa,0 6px 1px rgba(0,0,0,0.1),0 0 5px rgba(0,0,0,0.25),0 10px 10px rgba(0,0,0,0.2),0 20px 20px rgba(0,0,0,0.15);font-size:100px");
})
