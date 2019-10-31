//schedurater.js
// jalgrana-mitchhub-elbridge


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function correctURL(){
  while(!document.URL.includes("schedules/")){
    console.log(window.location.href);
    await sleep(5000);
  }

  alert("on schedule page");

  var container_class = "row week-spanning row-no-padding row-no-margin";

  var container = document.getElementsByClassName(container_class);

  var profs = new Set();


  if (container != null){
    for (var i = 1; i < container[0].children.length; i++){
      for (var j = 0; j < container[0].children[i].children.length; j++){
        var prof = container[0].children[i].children[j].children[1].children[1].children[2].children[0].children[1].innerHTML;
        prof = prof.replace(/\s+/g, '');
        profs.add(prof);
      }

    }
  }
  console.log(profs);
  alert("got profs");
}

correctURL();





