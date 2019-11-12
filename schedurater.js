//schedurater.js
// jalgrana-mitchhub-elbridge

let profsToDiv = {};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function setDisplayVisible(id){
  $("#"+id).first()[0].style.display = "block";
}

function setDisplayHidden(id){
  $("#"+id).first()[0].style.display = "none";
}

function addProfRating(rating, profName){
  for (let i = 0; i < profsToDiv[profName].length; i++){
    $("#"+profsToDiv[profName][i]).append("<b>" + profName + ":" + "</br>" + rating + "</br>");
  }
}

function clean(){
  profsToDiv = {};
}

function getProfsAndCreateDivs(){

  let profs = new Set();
  let id = 0;
  $("div.full-descr.hidden-xs.show-for-print").each(function(index){
    let idstring = "schedurater" + id;
    let prof = this.children[1].innerText.trim().split(",");
    if (prof != ""){
      console.log(prof);
      for (let p = 0; p < prof.length; p++){
        profs.add(prof[p]);
        if (!(prof[p] in profsToDiv)){
          profsToDiv[prof[p]] = [];
        }
        profsToDiv[prof[p]].push(idstring);
      }
      if (prof.length > 0){
        let newDiv = document.createElement("div");
        newDiv.id = idstring;
        newDiv.className = "profDiv";
        newDiv.style.width = "inherit";
        newDiv.style.height = "200px";
        newDiv.style.background = "#3BB6B4";
        newDiv.style.display = "none";
        newDiv.style.zIndex = "10000";
        newDiv.style.position = "absolute";
        this.parentNode.parentNode.parentNode.parentNode.appendChild(newDiv);
        this.addEventListener("mouseenter", () => {
          setDisplayVisible(idstring);
        },false);
        this.addEventListener("mouseleave", () => {
          setDisplayHidden(idstring);
        },false);
        id = id + 1;
      }
    }


  });
  return profs;
}

async function run(){
  let profs = getProfsAndCreateDivs();

  let arr_profs = Array.from(profs);
  for (var p = 0; p < arr_profs.length; p++){
    // For each professor, send the background script a request
    // that will be forwarded to RMP
    chrome.runtime.sendMessage(
      {
      contentScriptQuery: "queryRatings",
      profName: arr_profs[p]
      }
    );
  }
}

// Listen for the content script to make a rmp request
chrome.runtime.onMessage.addListener(
  function(request) {
    addProfRating(request.profRating, request.profName);
    return true;  // Will respond asynchronously
  }
);

async function main(){
  var prevURL = document.URL;
  while(true){
    if (prevURL !== document.URL){
      if (document.URL.includes("schedules/")){
        clean();
        run();
      }
    }
    prevURL = document.URL;
    await sleep(500);

  }
}

main();
