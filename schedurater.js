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
        var child = container[0].children[i].children[j].children[1].children[1];
        //they were assholes and put child nodes in different locations in the DOM
        for (var c = 0; c < child.children.length; c++){
          if (child.children[c].className === "meeting-text"){
            console.log(c)
            break
          }
        }
        var prof = child.children[c].children[0].children[1].innerHTML;

        profs.add(prof.trim());
      }

    }
  }
  console.log(profs);
  alert("got profs");
}

correctURL();





