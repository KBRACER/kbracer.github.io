$(function(){
  var tableData;
  
  $.ajax({
    url:'./speed.json',
    async:false,
    success:function(res){
      console.log(res);
      tableData = res

    }
  })

  var htmlStr = template('tb',{data:tableData})
  console.log(htmlStr);
  $('tbody').html(htmlStr)
  
  
})
