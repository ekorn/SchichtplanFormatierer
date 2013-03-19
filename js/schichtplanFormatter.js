define(['jquery', 'underscore'], function($,_) {

    var SchichtplannerFormatter = function() {
        var constructor,
            that = {},
            my = {};

        constructor = function() {
            return that;
        };
        
        
    that.stringToJSONObject = function (input){
        var res = my.CSVToArray(input, "\t");
        var group = res.shift();
        var start = res.shift();
        var end = res.shift();
        var header = res.shift();
        header = res.shift();

        var lastPerson = res[0][2];

        //group by the lines
        var data = $.map(res, function(value, index){
            var line = $.map(value, function(innerVal, innerIndex){
                if(innerVal !== ""){
                  return {"value": innerVal, "name": header[innerIndex], "pos": innerIndex};
                }
                
            });
            if(line.length >0){
              return {"line":line, "pos":index};
            }
        });

        //console.log("data", data.length, data);
        
        //console.log("lastPerson",lastPerson);
        
        //group by persons
        var data2 = [];
        var tmp = [];
        $.each(data, function(index, value){
            if(value.line[0].value !== ""){
            var day = my.parseDate( value.line[3].value);
            
                console.log("Date", day);
                if(lastPerson === value.line[2].value){
                    tmp.push(value);
                }else{
                    lastPerson = value.line[2].value;
                    data2.push(tmp);
                    tmp = [];
                    tmp.push(value);
                }
            }else{
              console.log("Problem Eintrag", value);
            }
        });
        data2.push(tmp);
        tmp = [];
        //console.log("data2", data2.length, data2);

        res = {};
        res.group = group;
        res.start = start;
        res.end = end;
        res.header = header;
        res.data = data2;


        return res;
    };
    
    that.printTables = function(schedules, target){
    target.empty();
    var trTmpl =  $('#trTmpl').html();
    var tableTmpl = $('#tableTmpl').html();
    var hrTmpl =  $('#hrTmpl').html();

    $.each(schedules.data, function(index, value){
        var trs = "";
        $.each(value, function(lineIndex, lineValue){
        var datumVar = "";
        if(!_.isUndefined(lineValue.line[3])){
          datumVar = lineValue.line[3].value;
        }
        var iststundenVar = "";
        if(!_.isUndefined(lineValue.line[4])){
          iststundenVar = lineValue.line[4].value;
        } 
        var eintragVar = "";
        if(!_.isUndefined(lineValue.line[5])){
          eintragVar = lineValue.line[5].value;
        }        
            trs += _.template(trTmpl,
                {
                "Datum": datumVar,
                "Iststunden": iststundenVar,
                "Eintrag": eintragVar
                 });
        });

        var table = _.template(tableTmpl,
                {
                "name" : value[0].line[0].value + ", "+value[0].line[1].value,
                "trs": trs
                 });
        target.append(table);
        target.append(hrTmpl);

    });
  };
  
    my.parseDate = function(dateString){
      // var dateString = "03.02.2013";
      var reggie = /(\d{2}).(\d{2}).(\d{4})/;
      var dateArray = reggie.exec(dateString); 
      var dateObject = null;
      if(dateArray != null){
        dateObject = new Date(
          (+dateArray[3]),
          (+dateArray[2])-1, // Careful, month starts at 0!
          (+dateArray[1])
        );
      }
      return dateObject;
    };


    // This will parse a delimited string into an array of
    // arrays. The default delimiter is the comma, but this
    // can be overriden in the second argument.
    my.CSVToArray = function ( strData, strDelimiter ){
      // Check to see if the delimiter is defined. If not,
      // then default to comma.
      strDelimiter = (strDelimiter || ",");

      // Create a regular expression to parse the CSV values.
      var objPattern = new RegExp(
          (
              // Delimiters.
              "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

              // Quoted fields.
              "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

              // Standard fields.
              "([^\"\\" + strDelimiter + "\\r\\n]*))"
          ),
          "gi"
          );


      // Create an array to hold our data. Give the array
      // a default empty first row.
      var arrData = [[]];

      // Create an array to hold our individual pattern
      // matching groups.
      var arrMatches = null;


      // Keep looping over the regular expression matches
      // until we can no longer find a match.
      while (arrMatches = objPattern.exec( strData )){

          // Get the delimiter that was found.
          var strMatchedDelimiter = arrMatches[ 1 ];

          // Check to see if the given delimiter has a length
          // (is not the start of string) and if it matches
          // field delimiter. If id does not, then we know
          // that this delimiter is a row delimiter.
          if (
              strMatchedDelimiter.length &&
              (strMatchedDelimiter != strDelimiter)
              ){

              // Since we have reached a new row of data,
              // add an empty row to our data array.
              arrData.push( [] );

          }


          // Now that we have our delimiter out of the way,
          // let's check to see which kind of value we
          // captured (quoted or unquoted).
          if (arrMatches[ 2 ]){

              // We found a quoted value. When we capture
              // this value, unescape any double quotes.
              var strMatchedValue = arrMatches[ 2 ].replace(
                  new RegExp( "\"\"", "g" ),
                  "\""
                  );

          } else {

              // We found a non-quoted value.
              var strMatchedValue = arrMatches[ 3 ];

          }


          // Now that we have our value string, let's add
          // it to the data array.
          arrData[ arrData.length - 1 ].push( strMatchedValue );
      }

      // Return the parsed data.
      return( arrData );
  };

        return constructor.apply(null, arguments);
    };

    return SchichtplannerFormatter;

});
