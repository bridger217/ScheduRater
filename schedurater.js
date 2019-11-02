//schedurater.js
// jalgrana-mitchhub-elbridge

class ProfRating {
  constructor(score, tags) {
    this.score = score;
    this.tags = tags;
  }
}

let profsToDiv = {};

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

function getProfsAndCreateDivs(){
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

        let newDiv = document.createElement("div");
        let id  = i.toString() + j.toString();

        newDiv.id = id;
        newDiv.style.width = "inherit";
        newDiv.style.height = "200px";
        newDiv.style.background = "#3BB6B4";
        newDiv.style.display = "none";
        newDiv.style.zIndex = "10000";
        newDiv.style.position = "absolute";
        container[0].children[i].children[j].appendChild(newDiv);
        container[0].children[i].children[j].addEventListener("mouseenter", () => {
          setDisplayVisible(id);
        },false);
        container[0].children[i].children[j].addEventListener("mouseleave", () => {
          setDisplayHidden(id);
        },false);

        let prof = child.children[c].children[0].children[1].innerText.trim().split(",");
        for (let p = 0; p < prof.length; p++){
          profs.add(prof[p]);
          if (!(prof[p] in profsToDiv)){
            profsToDiv[prof[p]] = [];
          }
          profsToDiv[prof[p]].push(id);
        }
      }
    }
  }
  console.log(profsToDiv);
  return profs;
}

async function run(){
  while(!document.URL.includes("schedules/")){
    console.log(window.location.href);
    await sleep(1000);
  }

  let profs = getProfsAndCreateDivs();


  console.log(profs);
  let arr_profs = Array.from(profs);
  for (var p = 0; p < arr_profs.length; p++){
    // For each professor, send the background script a request
    // that will be forwarded to RMP
    chrome.runtime.sendMessage(
    {contentScriptQuery: "queryRatings", profName: arr_profs[p]});
  }
}

run();
