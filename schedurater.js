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
    let a = document.createElement('a');
    a.innerText = profName;
    a.target = "_blank";
    a.style.color = "white";
    a.style.fontSize = "medium"
    a.style.fontWeight = "bold"
    a.style.display = "block"
    a.style.textAlign = "left";
    a.style.overflow = "scroll";
    $("#"+profsToDiv[profName][i]).append(a).css({"text-align": "left", "color": "white", "padding-left": "5px"});
    if (Object.entries(rating).length === 0) {
      $("#"+profsToDiv[profName][i]).append("Professor rating not found." + "</br>");
    }
    else {
      // url
      a.href = rating.url;
      // grade
      $("#"+profsToDiv[profName][i]).append("Overall: "  + rating.grade + "</br>" );
      // take again score
      $("#"+profsToDiv[profName][i]).append("Would take again: " + rating.takeAgain + "</br>");
      // level of difficulty
      $("#"+profsToDiv[profName][i]).append("Level of difficulty: " + rating.difficulty + "</br>");
      // num reviews
      $("#"+profsToDiv[profName][i]).append("Num reviews: " + rating.numReviews + "</br>");
      // top tags
      $("#"+profsToDiv[profName][i]).append("Top tags: " + "</br>");
      var tags = "<ul style=\"text-indent:-20px\">"
      for (let j = 0; j < rating.topTags.length; j++) {
        tags += "<li>" + rating.topTags[j] + "</li>"
      }
      tags += "</ul>"
      $("#"+profsToDiv[profName][i]).append(tags);
    }


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
        newDiv.style.height = "100px";
        newDiv.style.overflow = "auto"
        // newDiv.style.background = "#3BB6B4";
        newDiv.backgroundColor = this.parentNode.parentNode.parentNode.backgroundColor;
        style = getComputedStyle(this.parentNode.parentNode.parentNode.children[0],null)
        newDiv.style.backgroundColor = style.backgroundColor;
        newDiv.style.backgroundImage = style.backgroundImage;
        newDiv.style.backgroundSize = style.backgroundSize;
        newDiv.style.display = "none";
        newDiv.style.zIndex = "10000";
        newDiv.style.position = "absolute";
        newDiv.addEventListener("click",function(event){
          event.stopPropagation();
        },false);
        newDiv.addEventListener("onclick",function(event){
          event.stopPropagation();
        },false);
        this.parentNode.parentNode.parentNode.parentNode.appendChild(newDiv);
        this.parentNode.parentNode.parentNode.parentNode.addEventListener("mouseenter", () => {
          setDisplayVisible(idstring);
        },false);
        this.parentNode.parentNode.parentNode.parentNode.addEventListener("mouseleave", () => {
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
    let profName = arr_profs[p];
    // check local storage for this profs info
    chrome.storage.local.get(profName, function(result) {
          // weird way to check if we miss, but it works
          if (Object.entries(result).length === 0 &&
              result.constructor === Object)
          {
            // cache miss, make rmp request
            console.log("cache miss for " + profName);
            chrome.runtime.sendMessage(
              {
              contentScriptQuery: "queryRatings",
              profName: profName
              }
            );
          } else if (result[profName] === "NOT_FOUND") {
            // we know this prof does not have ratings
            console.log("cache HIT for " + profName);
            addProfRating({}, profName);
          } else {
            // cache hit with valid info, add that bitch
            console.log("cache HIT for " + profName);
            addProfRating(result[profName], profName);
          }
    });

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
