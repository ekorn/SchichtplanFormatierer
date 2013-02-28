
require.config({
    paths: {
        "jquery" : "jquery-1.9.1.min",
        "underscore" : "underscore-min",
        "moment": "moment.min",
        "moment_de": "lang/de",
        "schichtplanFormatter" : "schichtplanFormatter"
        
    },
    shim: {
        'moment_de': {
            deps: [
                'moment'
            ]
        },
        'moment' :{
        deps: [],
        exports: "moment"
        },
        'underscore' :{
        deps: [],
        exports: "_"
        }
    }
});

define(["jquery", "underscore",'moment', 'moment_de', "schichtplanFormatter"], function ($,_) {
    var schichtplanFormatter = require("schichtplanFormatter")();
    var moment =  require("moment");

    _.templateSettings = {
      interpolate: /\{\{(.+?)\}\}/g
    };
        
    moment.lang('de');
    
     // Check for the various File API support.
    if (window.File && window.FileReader && window.FileList && window.Blob) {
      // Great success! All the File APIs are supported.
    } else {
      alert('Die File APIs werden von deinem Browser nicht unterstützt. Bitte versuch es mit einem andern (z.B. aktuellen Firefox)');
          }
  

  $("#fileChooser").change(function(event){
    $("#progressbar").show();
    handleFileSelect(event, function(fileConetent){
              
              var res = schichtplanFormatter.stringToJSONObject(fileConetent);
              schichtplanFormatter.printTables(res, $('#schedule'));
              $("#progressbar").hide(2000);
              //Check local Storage support.
              if(('localStorage' in window) && window['localStorage'] !== null){
                var savedTime = Number(localStorage.getItem("savedTimeKey"));
                savedTime += res.data.length;
                localStorage.setItem("savedTimeKey",savedTime);
                var humanTime = moment.duration(savedTime, 'minutes').humanize();
                $('#usageInfo').html("Du hast " + humanTime + " nicht mit stupider Arbeit verbracht.");
              }
              $("#optionsArea").show(1000);
    });
  });

  $("#pageBreakAfterDay").change(function(event){
    var dates = $(".dateTd");
    $.each(dates, function(index, value){
      var date = $(value).html().substring(0,2);
      if(date == event.currentTarget.value){
        //console.log("date",date);
        $(value).parent().after('<tr class="breakPage innerTableBreak" ></tr>');
      }
    });
  //  console.log("pageBreakAfterDay", event.currentTarget.value );

  });

  $("#deleteInnerPageBreaks").click(function(){
    //console.log("Remove",$('.innerTableBreak'));
    $('.innerTableBreak').remove();
  })

  $("#fontSize").change(function(event){
    //console.log("fontSize", event.currentTarget.value);
    $("tbody").css("font-size", event.currentTarget.value + "px");
  });
  
  $("#columHeight").change(function(event){
    //console.log("columHeight", event.currentTarget.value);
    $("td").css("height", event.currentTarget.value + "px");
  });


function handleFileSelect(evt, callback) {
    var files = evt.target.files; // FileList object

    // Loop through the FileList.
    for (var i = 0, f; f = files[i]; i++) {
        //console.log("Type ", f.type);
      // Only process image files.
      if (!f.type.match('text/*')) {
        continue;
      }else{
          console.log("Type ", f.type);
      }

      var reader = new FileReader();

      // Closure to capture the file information.
      reader.onload = (function(theFile) {
        return function(e) {
            callback(e.target.result);
        };
      })(f);
      reader.readAsText(f, 'ISO-8859-1');
    }
  }
  
});


