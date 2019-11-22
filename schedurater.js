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

  var url = chrome.runtime.getURL("images/star.png");


  console.log(profsToDiv);
  if (!jQuery.isEmptyObject(profsToDiv)){
    for (let i = 0; i < profsToDiv[profName].length; i++){
      let name = document.createElement('a');
      name.className = "name"
      name.innerText = profName;
      // a.target = "_blank";
      // a.style.color = "black";
      // a.style.fontSize = "14px"
      // a.style.display = "block"
      // a.style.textAlign = "left";
      // a.style.overflow = "scroll";

      $("#"+profsToDiv[profName][i]).append(name);
      if (Object.entries(rating).length === 0) {
        $("#"+profsToDiv[profName][i]).append("Professor rating not found." + "</br>");
      }
      else {
        // url
        name.href = rating.url;
        name.target = "_blank"
        // grade
        let score = document.createElement('p');
        score.className = "score"

        score.innerText = rating.grade;
        $("#"+profsToDiv[profName][i]).append(score);
        // take again score
        // level of difficulty

        let text = document.createElement('p');
        text.className = "text"
        text.innerText = "Num reviews: " + rating.numReviews + "\n" + "Would take again: " + rating.takeAgain + "\n" + "Level of difficulty: " + rating.difficulty + "\n"
        $("#"+profsToDiv[profName][i]).append(text);
        // top tags

        let aa = document.createElement('p');
        aa.id = profsToDiv[profName][i] + "abc"
        aa.className = "pp"
        $('#'+profsToDiv[profName][i]).append(aa);

        let des = document.createElement('p');
        des.className = "des"
        des.innerText = "Energetic"
        $('#' + profsToDiv[profName][i] + "abc").append(des);

        let count = document.createElement('p');
        count.className = "count"
        count.innerText = "6"
        $('#' + profsToDiv[profName][i] + "abc").append(count);
        $('#' + profsToDiv[profName][i] + "abc").append("</br>");

        des = document.createElement('p');
        des.className = "des"
        des.innerText = "Lots of Homework"
        $('#' + profsToDiv[profName][i] + "abc").append(des);

        count = document.createElement('p');
        count.className = "count"
        count.innerText = "3"
        $('#' + profsToDiv[profName][i] + "abc").append(count);
        $('#' + profsToDiv[profName][i] + "abc").append("</br>");

        des = document.createElement('p');
        des.className = "des"
        des.innerText = "Caring"
        $('#' + profsToDiv[profName][i] + "abc").append(des);

        count = document.createElement('p');
        count.className = "count"
        count.innerText = "1"
        $('#' + profsToDiv[profName][i] + "abc").append(count);
        $('#' + profsToDiv[profName][i] + "abc").append("</br>");




      }
      $('#'+profsToDiv[profName][i]).append($('<img>',{id:'theImg',src:url}));

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

        // newDiv.style.width = "inherit";
        // newDiv.style.height = "100px";
        // newDiv.style.overflow = "auto"
        // newDiv.style.background = "#3BB6B4";
        newDiv.backgroundColor = this.parentNode.parentNode.parentNode.backgroundColor;
        style = getComputedStyle(this.parentNode.parentNode.parentNode.children[0],null)
        newDiv.style.backgroundColor = "#5A5A5A";
        newDiv.style.borderColor = style.backgroundColor;
      //newDiv.style.backgroundImage = style.backgroundImage;
        //newDiv.style.backgroundSize = style.backgroundSize;
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
