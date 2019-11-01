//schedurater.js
// jalgrana-mitchhub-elbridge

class ProfRating {
  constructor(score, tags) {
    this.score = score;
    this.tage = tags;
  }
}

// String prototype to replace all occurences, not just the first
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

// function make(prof){
//
// }

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function setDisplayVisible(id){
  document.getElementById(id).style.display = "block";
}

function setDisplayHidden(id){
  console.log(id);
  document.getElementById(id).style.display = "none";
}

async function correctURL(){
  while(!document.URL.includes("schedules/")){
    console.log(window.location.href);
    await sleep(1000);
  }

  let container_class = "row week-spanning row-no-padding row-no-margin";

  let container = document.getElementsByClassName(container_class);

  let profs = new Set();


  if (container != null){
    for (let i = 1; i < container[0].children.length; i++){
      for (let j = 0; j < container[0].children[i].children.length; j++){
        let child = container[0].children[i].children[j].children[1].children[1];
        let c = 0;
        for (c = 0; c < child.children.length; c++){
          if (child.children[c].className === "meeting-text"){
            break
          }
        }
        let prof = child.children[c].children[0].children[1].innerText;

        let newDiv = document.createElement("div");
        let id  = i.toString() + j.toString();

        newDiv.id = id;
        newDiv.style.width = "100px";
        newDiv.style.height = "100px";
        newDiv.style.background = "red";
        newDiv.style.display = "none";
        container[0].children[i].children[j].appendChild(newDiv);
        container[0].children[i].children[j].addEventListener("mouseenter", () => {
          setDisplayVisible(id);
        },false);
        container[0].children[i].children[j].addEventListener("mouseleave", () => {
          setDisplayHidden(id);
        },false);
        profs.add(prof.trim());
      }
    }
  }
  console.log(profs);

  const Http = new XMLHttpRequest();

  let arr_profs = Array.from(profs);
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
      var dummyDOM = document.createElement("html");
      dummyDOM.innerHTML = Http;
      console.log(document.getElementsByTagName('*').length);
      const listings = document.getElementsByClassName("listing PROFESSOR");
      for (let l of listings) { console.log(l.listing-name.main); }
    }
  }

  let ifrm = document.createElement('iframe');
  ifrm.setAttribute('id', 'ifrm');
  ifrm.src = chrome.runtime.getURL('iframe.html');
  document.body.appendChild(ifrm);
}

correctURL();
