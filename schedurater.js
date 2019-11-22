//schedurater.js
// jalgrana-mitchhub-elbridge
let num_ratings = 0;
let profsToDiv = {};
let profRating = {};
let idToProfs = {};
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
  num_ratings++;
  profRating[profName] = rating;
}

function changeProf(profNum, parentDiv){
  console.log(parentDiv);
  console.log(idToProfs[parentDiv.id]);
  console.log(profNum);
  $("#"+parentDiv.id).children(".name")[0].innerText = idToProfs[parentDiv.id][profNum];
}

function initSelectors(){
  $(".selector").change(function(){
    changeProf($(this).val(), this.parentNode);
  });
}

function initDivs(){
  var url = chrome.runtime.getURL("images/star.png");
  $(".profDiv").each(function(){
    let profName = idToProfs[this.id][0];
    let rating = profRating[profName];
    let name = document.createElement('a');
    name.className = "name";
    name.innerText = profName;
    this.append(name);
    // $("#"+profsToDiv[profName][0]).append(name);
    if (Object.entries(rating).length === 0) {
      // $("#"+profsToDiv[profName][0]).append("Professor rating not found." + "</br>");
      this.append("Professor rating not found." + "</br>");
    }
    else {
      // url
      name.href = rating.url;
      name.target = "_blank"
      // grade

      let overall = document.createElement('p');
      overall.id = this.id + "overall"
      overall.className = "overall"
      this.append(overall);

      let score = document.createElement('p');
      score.className = "score"
      score.innerText = rating.grade;
      $("#"+ this.id + "overall").append(score);

      let overallText = document.createElement('p');
      overallText.className = "overallText";
      overallText.innerText = "OVERALL";
      $("#"+ this.id + "overall").append(overallText);


      let difficulty = document.createElement('p');
      difficulty.id = this.id + "difficulty"
      difficulty.className = "difficulty"
      this.append(difficulty);

      let difScore = document.createElement('p');
      difScore.className = "difScore"
      difScore.innerText = rating.difficulty;
      $("#"+ this.id + "difficulty").append(difScore);

      let difText = document.createElement('p');
      difText.className = "difText";
      difText.innerText = "DIFFICULTY";
      $("#"+ this.id + "difficulty").append(difText);

      let takeAgain = document.createElement('p');
      takeAgain.id = this.id + "takeAgain"
      takeAgain.className = "takeAgain"
      this.append(takeAgain);

      let percent = document.createElement('p');
      percent.className = "percent"
      percent.innerText = rating.takeAgain;
      $("#"+ this.id + "takeAgain").append(percent);

      let takeAgainText = document.createElement('p');
      takeAgainText.className = "takeAgainText";
      takeAgainText.innerText = "WOULD TAKE AGAIN";
      $("#"+this.id + "takeAgain").append(takeAgainText);



      let commonTags = document.createElement('p');
      commonTags.className = "commonTags"
      commonTags.innerText = "COMMON TAGS:"
      $('#'+this.id).append(commonTags);


      if (!jQuery.isEmptyObject(rating.tags)){
        for (let j  = 0; j < rating.tags.length; j++) {
          let tagPair = document.createElement('p');
          tagPair.id = this.id + "tagPair"
          tagPair.className = "tagPair"
          $('#'+this.id).append(tagPair);

          let tagWord = document.createElement('p');
          tagWord.className = "tagWord"
          tagWord.innerText = rating.tags[j].tagText;
          $('#' + this.id + "tagPair").append(tagWord);

          let tagCount = document.createElement('p');
          tagCount.className = "tagCount"
          tagCount.innerText = rating.tags[j].tagNum;
          $('#' + this.id + "tagPair").append(tagCount);
          $('#' + this.id + "tagPair").append("</br>");

        }
      }


      let reviewCount = document.createElement('p');
      reviewCount.className = "reviewCount"
      reviewCount.innerText = "FROM " + rating.numReviews + " REVIEWS"
      $('#'+this.id).append(reviewCount);


    }
    this.append($('<img>',{id:'theImg',src:url}));

  });
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
        newDiv.backgroundColor = this.parentNode.parentNode.parentNode.backgroundColor;
        style = getComputedStyle(this.parentNode.parentNode.parentNode.children[0],null)
        newDiv.style.backgroundColor = "#5A5A5A";
        newDiv.style.borderColor = style.backgroundColor;
        newDiv.style.display = "none";
        newDiv.style.zIndex = "10000";
        newDiv.style.position = "absolute";

        if (prof.length > 1){
          let html_str = "<select class=\"selector\">";
          for (let p = 0; p < prof.length; p++){
            html_str += "<option value=" + p + ">" + prof[p] + "</option>";
           }
           html_str += "</select>";
           newDiv.innerHTML += html_str;
        }


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
        idToProfs[idstring] = prof;
        id = id + 1;

      }
    }


  });

  return profs;
}

async function run(){
  num_ratings = 0;
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
  while (num_ratings < arr_profs.length){
    await sleep(200);
  }
  initDivs();
  initSelectors();

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
