//schedurater.js
// jalgrana-mitchhub-elbridge


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// String prototype to replace all occurences, not just the first
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

// function make(prof){
//
// }

function setDisplayVisible(id){
  console.log(id);
  document.getElementById(id).style.display = "block";
}

function setDisplayHidden(id){
  console.log(id);
  document.getElementById(id).style.display = "hidden";
}


async function correctURL(){
  while(!document.URL.includes("schedules/")){
    console.log(window.location.href);
    await sleep(5000);
  }

  var container_class = "row week-spanning row-no-padding row-no-margin";

  var container = document.getElementsByClassName(container_class);

  var profs = new Set();


  if (container != null){
    for (var i = 1; i < container[0].children.length; i++){
      for (var j = 0; j < container[0].children[i].children.length; j++){
        var child = container[0].children[i].children[j].children[1].children[1];
        for (var c = 0; c < child.children.length; c++){
          if (child.children[c].className === "meeting-text"){
            break
          }
        }
        var prof = child.children[c].children[0].children[1].innerText;

        var newDiv = document.createElement("div");
        var id  = i.toString() + j.toString();

        newDiv.id = id;
        newDiv.style.width = "100px";
        newDiv.style.height = "100px";
        newDiv.style.background = "red";
        newDiv.style.display = "none";
        container[0].children[i].children[j].appendChild(newDiv);
        container[0].children[i].children[j].addEventListener("mouseover", function(){
          newDiv.style.display = "block";
        });
        container[0].children[i].children[j].addEventListener("mouseout", function(){
          newDiv.style.display = "none";
        });
        profs.add(prof.trim());
      }
    }
  }
  console.log(profs);

  const Http = new XMLHttpRequest();

  var arr_profs = Array.from(profs);
  console.log(arr_profs);
  console.log(arr_profs.length);
  for (var p = 0; p < arr_profs.length; p++){
    var search = "https://www.ratemyprofessors.com/search.jsp?query=";
    search += arr_profs[p].replaceAll(" ","+");
    console.log(search);
    Http.open("GET", search);
    Http.send();

    Http.onreadystatechange = (e) => {
      console.log(Http.responseText);
    }
  }

  var ifrm = document.createElement('iframe');
  ifrm.setAttribute('id', 'ifrm');
  ifrm.src = chrome.runtime.getURL('iframe.html');
  document.body.appendChild(ifrm);
}

correctURL();
