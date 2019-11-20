$(function(){
  var tableData;
  template.defaults.imports.timeFormat = function(date){
    var timeArr = date.split('.')
    ,sec = timeArr[0] % 60
    ,min
    timeArr[0] >= 60 ? min = 1: min = 0
    sec < 10 ? sec = '0'+sec:null
    return `${min}：${sec}.${timeArr[1]}`
  }
  $.ajax({
    url:'./speed.json?v=201911291717',
    async:false,
    success:function(res){
      // console.log(res);
      tableData = res
    }
  })

  var htmlStr = template('tb',{data:tableData})
  $('tbody').html(htmlStr)
  
  
})
