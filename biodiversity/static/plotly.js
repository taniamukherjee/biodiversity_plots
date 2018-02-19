function init() {
    console.log("inside init - plotly1.js")
  
    document.getElementById("selection").addEventListener("change", function(e) {
      var sampleID = e.target.value
      Promise.all([
        fetch(`/metadata/${sampleID}`).then(x => x.json()), //@app.route('/metadata/<sample>')
        fetch(`/wfreq/${sampleID}`).then(x => x.json()),    //@app.route('/wfreq/<sample>')
        fetch(`/samples/${sampleID}`).then(x => x.json())  //@app.route('/samples/<sample>')
      ]).then(function (a) {  //'a' = array of results of 3 promises above
          console.log("a[0]=", a[0])
          console.log("a[1]=", a[1])
          console.log("a[2]=", a[2])
          var list = document.getElementById('meta') //prints to webpage due to "meta" html tag
          list.innerHTML = "",  //clears list of the previous content from webpage before printing below
          console.log("after innerHTML")
          for (var x in a[0]) {  
            var listElement = document.createElement('li')
            listElement.innerText = `${x}: ${a[0][x]}`
            list.appendChild(listElement)
            console.log("after appendChild")
            }
          // var s1 = "new" ; var s2 = `This is ${s} toy` ; //back-ticks only; not quotes
          // console.log(s2) produces "This is new toy"
          // ${} is a way of printing a variable inside a string without using "" and +
        
          document.getElementById("freq").innerHTML = "Washing Frequency =" + a[1]
          
          var data = [{
            values: a[2][0].sample_values.slice(0, 10),
            labels: a[2][0].otu_id.slice(0, 10),
            type: "pie"
            }]
      
          var layout = {
            height: 400,
            width: 400
            };
      
          Plotly.plot("pie", data, layout); //overlay data structure built in.
        })
      })
  
    function updatePlotly(newdata) { //Plotly.restyle` updates chart on new selected sample 
      var PIE = document.getElementById("pie");
      Plotly.restyle(PIE, "values", [newdata]);
    }
  
    updatePlotly(data);
  };
  
  init();