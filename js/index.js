$(function () {

    var jsonData
    function setTable(arr) {
        var htmlStr = template('tb', {
            data: arr
        })
        $("#tb_results > tbody").html(htmlStr)
        if($('#tb_drag').length){
            var htmlStr2 = template('tb_drag', {
                data: arr
            })
            $("#tb_drg_results > tbody").html(htmlStr2)   
        }
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
        url: './speed.json',
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
    
    //选择改装程度
    $('#mods').on('change',function(){
        var mods = $(this).val(),
            arr

        if(mods == 'all'){
            setTable(jsonData)
        }else{
            arr = jsonData.filter(function(v){
                return v.mods == mods
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

})
