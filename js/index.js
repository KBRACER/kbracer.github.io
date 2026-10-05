$(function () {
  var jsonData;
  var goldData;
  var bigVData;
  var sortState = {
    ruisi: { key: "speed", order: "asc" },
    gold: { key: "speed", order: "asc" },
    bigV: { key: "speed", order: "asc" },
  };

  function setTable(arr) {
    var htmlStr = template("tb", {
      data: arr,
    });
    $("#tb_results > tbody").html(htmlStr);
  }
  function setTableGold(arr) {
    var htmlStr = template("tb2", {
      data: arr,
    });
    $("#tb_results2 > tbody").html(htmlStr);
  }
  function setTableBigV(arr) {
    var htmlStr = template("tb3", {
      data: arr,
    });
    $("#tb_results3 > tbody").html(htmlStr);
  }

  function renderTable(type, arr) {
    switch (type) {
      case "ruisi":
        setTable(arr);
        break;
      case "gold":
        setTableGold(arr);
        break;
      case "bigV":
        setTableBigV(arr);
        break;
      default:
        break;
    }
  }

  function getDataByType(type) {
    if (type === "ruisi") return jsonData;
    if (type === "gold") return goldData;
    if (type === "bigV") return bigVData;
    return [];
  }

  function parseSortValue(row, key) {
    var value = row[key];
    if (key === "car" || key === "driver") {
      return (value || "").toString().toLowerCase();
    }
    var numeric = parseFloat(value);
    return isNaN(numeric) ? Number.MAX_SAFE_INTEGER : numeric;
  }

  function sortData(arr, type) {
    var state = sortState[type] || {};
    if (!state.key) return arr;
    var order = state.order === "desc" ? -1 : 1;
    return arr.slice().sort(function (a, b) {
      var va = parseSortValue(a, state.key);
      var vb = parseSortValue(b, state.key);
      if (typeof va === "string" || typeof vb === "string") {
        return va.localeCompare(vb, "zh-Hans-CN") * order;
      }
      return (va - vb) * order;
    });
  }

  function getTableSelector(type) {
    if (type === "ruisi") return "#tb_results";
    if (type === "gold") return "#tb_results2";
    if (type === "bigV") return "#tb_results3";
    return "";
  }

  function updateSortIndicators(type) {
    var tableSelector = getTableSelector(type);
    var state = sortState[type];
    if (!tableSelector || !state) return;
    var $table = $(tableSelector);
    $table.find("th.sortable").removeClass("sort-asc sort-desc");
    $table
      .find('th[data-sort-key="' + state.key + '"]')
      .addClass(state.order === "desc" ? "sort-desc" : "sort-asc");
  }

  function refreshTable(type) {
    var data = getDataByType(type);
    if (!Array.isArray(data)) return;
    var filtered = screen(data, type, { render: false });
    var sorted = sortData(filtered, type);
    renderTable(type, sorted);
    updateSortIndicators(type);
  }

  function refreshAllTables() {
    refreshTable("ruisi");
    refreshTable("gold");
    refreshTable("bigV");
  }

  template.defaults.imports.timeFormat = function (date) {
    var timeArr = date.split("."),
      sec = timeArr[0] % 60,
      min;
    timeArr[0] >= 60 ? (min = 1) : (min = 0);
    sec < 10 ? (sec = "0" + sec) : null;
    return `${min}:${sec}.${timeArr[1]}`;
  };
  // 获取数据：file:// 下使用预加载 JS，http(s) 下读取 JSON，兼容静态服务器和本地双击打开。
  if (window.location.protocol === "file:") {
    var localData = window.__KBRACER_LOCAL_DATA__ || {};
    goldData = localData.goldport || [];
    jsonData = localData.speed || [];
    bigVData = localData.bigV || [];
    refreshAllTables();
  } else {
    $.ajax({
      url: "./goldport.json?v=20240306",
      success: function (res) {
        console.log("goldport", res);
        goldData = res;
        refreshTable("gold");
      },
    });
    $.ajax({
      url: "./speed.json?v=20240226",
      success: function (res) {
        console.log("ruisi", res);
        jsonData = res;
        refreshTable("ruisi");
      },
    });
    $.ajax({
      url: "./bigV.json?v=20240226",
      success: function (res) {
        console.log("bigV", res);
        bigVData = res;
        refreshTable("bigV");
      },
    });
  }

  $(".mods,.lv,.powerType,.producer").on("change", function () {
    refreshAllTables();
  });
  // 筛选
  function screen(arr, type, options) {
    var shouldRender = !options || options.render !== false;
    var lv = $(".lv").val(),
      mods = $(".mods").val(),
      powerType = $(".powerType").val(),
      producer = $(".producer").val(),
      search = $(".search").val().toLowerCase();

    // 车型级别
    if (lv !== "all") {
      if (lv == "SUV") {
        arr = arr.filter(function (v) {
          return ["SUV1", "SUV2", "SUV3", "SUV4", "SUV5"].includes(v.lv);
        });
      } else if (lv == "0") {
        arr = arr.filter(function (v) {
          return ["A00", "A0", "A", "B", "C", "D"].includes(v.lv);
        });
      } else {
        arr = arr.filter(function (v) {
          return v.lv == lv;
        });
      }
    }

    // 改装程度
    if (mods == "all") {
      // setTable(jsonData)
    } else if (mods == 0) {
      arr = arr.filter(function (v) {
        return v.mods <= 0;
      });
    } else {
      arr = arr.filter(function (v) {
        return v.mods > 0;
      });
    }

    // 动力类型： 0 燃油 ， 1 电动
    if (powerType != "all") {
      arr = arr.filter(function (v) {
        return v.powerType == powerType;
      });
    }

    // 产地： 0 国产， 1 合资 ， 2 进口
    if (producer != "all") {
      arr = arr.filter(function (v) {
        return v.producer == producer;
      });
    }

    if (search) {
      arr = arr.filter(function (v) {
        return v.car.toLowerCase().indexOf(search) != -1;
      });
    }
    console.log(type, arr);

    if (shouldRender) {
      var sorted = sortData(arr, type);
      renderTable(type, sorted);
      updateSortIndicators(type);
    }

    return arr;
  }

  //搜索车型
  $(".search").on("input", function () {
    refreshAllTables();
  });

  $("th[data-sort-key]").on("click", function () {
    var $th = $(this);
    var sortKey = $th.data("sortKey");
    var tableId = $th.closest("table").attr("id");
    var type = tableId === "tb_results" ? "ruisi" : tableId === "tb_results2" ? "gold" : "bigV";

    if (sortState[type].key === sortKey) {
      sortState[type].order = sortState[type].order === "asc" ? "desc" : "asc";
    } else {
      sortState[type].key = sortKey;
      sortState[type].order = "asc";
    }

    refreshTable(type);
  });
  // button动效
  document.querySelector(".button").onmousemove = (e) => {
    const x = e.pageX - e.target.offsetLeft;
    const y = e.pageY - e.target.offsetTop;
    e.target.style.setProperty("--x", `${x}px`);
    e.target.style.setProperty("--y", `${y}px`);
  };

  // 榜单切换
  $('.box-tabs .tab').on('click',function(){
    var index = $(this).index()
    $(this).addClass('active').siblings().removeClass('active')
    $('.table-hover').eq(index).addClass('active').siblings().removeClass('active')
    // console.log($(this).addClass('active').siblings());
  })

  // // 榜单说明
  $(".button").on("click", function () {
    layer.open({
      type: 1,
      area: ["820px", "640px"],
      title: null,
      shade: false,
      content: $(".tips"),
    });
  });

  // // 改装程度
  // $('.mods .icon').click(function () {
  //   layer.open({
  //     type: 1,
  //     shade: false,
  //     title: false,
  //     content: $('.tips-content-mods'),
  //   });
  // })
  // // 气温
  // $('.temperature .icon').click(function () {
  //   layer.open({
  //     type: 1,
  //     shade: false,
  //     title: false,
  //     content: $('.tips-content-temperature'),
  //   });
  // })
  // // 轮胎
  // $('.tyre .icon').click(function () {
  //   layer.open({
  //     type: 1,
  //     shade: false,
  //     title: false,
  //     content: $('.tips-content-tyre'),
  //   });
  // })
  // // 尾速
  // $('.limit .icon').click(function () {
  //   layer.open({
  //     type: 1,
  //     shade: false,
  //     title: false,
  //     content: $('.tips-content-limit'),
  //   });
  // })
  // // 排名 飞行圈说明
  // $('.ranking .icon').click(function () {
  //   layer.open({
  //     type: 1,
  //     shade: false,
  //     title: false,
  //     content: $('.tips-content-ranking'),
  //   });
  // })
  // // 圈速
  // $('.speed .icon').click(function () {
  //   layer.open({
  //     type: 1,
  //     shade: false,
  //     title: false,
  //     content: $('.tips-content-speed'),
  //   });
  // })
  (function () {
    var width,
      height,
      largeHeader,
      canvas,
      ctx,
      points,
      target,
      animateHeader = true;

    // Main
    initHeader();
    initAnimation();
    addListeners();

    function initHeader() {
      // width = window.innerWidth;
      // height = window.innerHeight;
      target = { x: width / 2, y: height / 2 };

      largeHeader = document.querySelector("body");
      // largeHeader = document.getElementById("canvas_bg");
      // largeHeader.style.height = height + "px";
      width = largeHeader.offsetWidth;
      height = largeHeader.offsetHeight;

      canvas = document.getElementById("canvas1");
      canvas.width = width;
      canvas.height = height;
      ctx = canvas.getContext("2d");

      // create points
      points = [];
      for (var x = 0; x < width; x = x + width / 20) {
        for (var y = 0; y < height; y = y + height / 20) {
          var px = x + (Math.random() * width) / 20;
          var py = y + (Math.random() * height) / 20;
          var p = { x: px, originX: px, y: py, originY: py };
          points.push(p);
        }
      }

      // for each point find the 5 closest points
      for (var i = 0; i < points.length; i++) {
        var closest = [];
        var p1 = points[i];
        for (var j = 0; j < points.length; j++) {
          var p2 = points[j];
          if (!(p1 == p2)) {
            var placed = false;
            for (var k = 0; k < 5; k++) {
              if (!placed) {
                if (closest[k] == undefined) {
                  closest[k] = p2;
                  placed = true;
                }
              }
            }

            for (var k = 0; k < 5; k++) {
              if (!placed) {
                if (getDistance(p1, p2) < getDistance(p1, closest[k])) {
                  closest[k] = p2;
                  placed = true;
                }
              }
            }
          }
        }
        p1.closest = closest;
      }

      // assign a circle to each point
      for (var i in points) {
        var c = new Circle(
          points[i],
          2 + Math.random() * 2,
          "rgba(255,255,255,0.3)"
        );
        points[i].circle = c;
      }
    }

    // Event handling
    function addListeners() {
      if (!("ontouchstart" in window)) {
        window.addEventListener("mousemove", mouseMove);
      }
      window.addEventListener("scroll", scrollCheck);
      // window.addEventListener("resize", resize);
    }

    function mouseMove(e) {
      // var posx = (posy = 0);
      // if (e.pageX || e.pageY) {
      //   posx = e.pageX;
      //   posy = e.pageY;
      // } else if (e.clientX || e.clientY) {
      //   posx =
      //     e.clientX +
      //     document.body.scrollLeft +
      //     document.documentElement.scrollLeft;
      //   posy =
      //     e.clientY +
      //     document.body.scrollTop +
      //     document.documentElement.scrollTop;
      // }
      var scrTop = largeHeader.parentNode.offsetTop,
        l = largeHeader.parentNode.offsetLeft,
        h = largeHeader.parentNode.offsetHeight;

      if (e.pageY >= scrTop && e.pageY <= scrTop + h) {
        target.x = e.pageX - l;
        // target.y = e.offsetY;
        target.y = e.pageY - scrTop;
      } else {
        target.x = -500;
        target.y = -500;
      }
    }

    function scrollCheck() {
      if (document.body.scrollTop > height) animateHeader = false;
      else animateHeader = true;
    }

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      largeHeader.style.height = height + "px";
      canvas.width = width;
      canvas.height = height;
    }

    // animation
    function initAnimation() {
      animate();
      for (var i in points) {
        shiftPoint(points[i]);
      }
    }

    function animate() {
      if (animateHeader) {
        ctx.clearRect(0, 0, width, height);
        for (var i in points) {
          // detect points in range
          if (Math.abs(getDistance(target, points[i])) < 4000) {
            points[i].active = 0.3;
            points[i].circle.active = 0.6;
          } else if (Math.abs(getDistance(target, points[i])) < 20000) {
            points[i].active = 0.1;
            points[i].circle.active = 0.3;
          } else if (Math.abs(getDistance(target, points[i])) < 40000) {
            points[i].active = 0.02;
            points[i].circle.active = 0.1;
          } else {
            points[i].active = 0;
            points[i].circle.active = 0;
          }

          drawLines(points[i]);
          points[i].circle.draw();
        }
      }
      requestAnimationFrame(animate);
    }

    function shiftPoint(p) {
      TweenLite.to(p, 1 + 1 * Math.random(), {
        x: p.originX - 50 + Math.random() * 100,
        y: p.originY - 50 + Math.random() * 100,
        ease: Circ.easeInOut,
        onComplete: function () {
          shiftPoint(p);
        },
      });
    }

    // Canvas manipulation
    function drawLines(p) {
      if (!p.active) return;
      for (var i in p.closest) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.closest[i].x, p.closest[i].y);
        ctx.strokeStyle = "rgba(156,217,249," + p.active + ")";
        ctx.stroke();
      }
    }

    function Circle(pos, rad, color) {
      var _this = this;

      // constructor
      (function () {
        _this.pos = pos || null;
        _this.radius = rad || null;
        _this.color = color || null;
      })();

      this.draw = function () {
        if (!_this.active) return;
        ctx.beginPath();
        ctx.arc(_this.pos.x, _this.pos.y, _this.radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = "rgba(156,217,249," + _this.active + ")";
        ctx.fill();
      };
    }

    // Util
    function getDistance(p1, p2) {
      return Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
    }
  })();
  console.log(
    "%c键盘车神教圈速榜 by铲子",
    "text-shadow:0 1px 0 #ccc,0 2px 0 #c9c9c9,0 3px 0 #bbb, 0 4px 0 #b9b9b9,0 5px 0 #aaa,0 6px 1px rgba(0,0,0,0.1),0 0 5px rgba(0,0,0,0.25),0 10px 10px rgba(0,0,0,0.2),0 20px 20px rgba(0,0,0,0.15);font-size:100px"
  );
});
