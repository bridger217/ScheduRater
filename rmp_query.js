// String prototype to replace all occurences, not just the first
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

function handleHttpErrors(response) {
    if (!response.ok) {
      throw Error(response.statusText);
    }
    return response;
}

function cacheProfRating(profName, profRating) {
  // cache this professor's rating
  let cacheObj = {}
  cacheObj[profName] = profRating;
  chrome.storage.local.set(cacheObj, function() {

    if (chrome.runtime.lastError) {
      // cache is full (5MB), clear it i guess? idk, not tryna
      // implement an LRU eviction
      console.log('cache full, clearing...');
      chrome.storage.local.clear(function() {
        var error = chrome.runtime.lastError;
        if (error) {
            console.error(error);
        } else {
          // retry this store
          cacheProfRating(profName, profRating)
        }
      });
    } else {
      // successful write
      console.log('cached ' + profName);
    }
  });
}

function cacheProfMiss(profName) {
  let cacheObj = {};
  cacheObj[profName] = "NOT_FOUND";

  chrome.storage.local.set(cacheObj, function() {

    if (chrome.runtime.lastError) {
      // cache is full (5MB), clear it i guess? idk, not tryna
      // implement an LRU eviction
      console.log('cache full, clearing...');
      chrome.storage.local.clear(function() {
        var error = chrome.runtime.lastError;
        if (error) {
            console.error(error);
        } else {
          // retry this store
          cacheProfMiss(profName);
        }
      });
    } else {
      // successful write
      console.log('cached ' + profName);
    }
  });
}

// This will only be used when we have a cache miss on a professor
// with no ratings available. Kinda sloppy but can refactor later.
function sendUnavailableProf(profName) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    // TODO: send an object to the content script (same one used in cache)
    chrome.tabs.sendMessage(tabs[0].id, {profRating: {}, profName: profName});
  });
}

function handleRatingsResponse(ratingsPageHTML, profName, url) {
  var ratingsPageDOM = $($.parseHTML(ratingsPageHTML));
  var profRating = new Object();

  // Parse each field of the html
  profRating.grade = $(".grade", ratingsPageDOM).text().substring(0, 4);
  profRating.url = url;

  cacheProfRating(profName, profRating)

  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    // TODO: send an object to the content script (same one used in cache)
    chrome.tabs.sendMessage(tabs[0].id, {profRating: profRating, profName: profName});
  });
}

function searchForRatings(url, profName) {
  fetch(url)
    .then(response => handleHttpErrors(response))
    .then(response => response.text())
    .then(text => handleRatingsResponse(text, profName, url))
    .catch(error => console.log(error))

  return true;
}

function handleQueryResponse(searchPageHTML, profName) {
  var searchPageDOM = $($.parseHTML(searchPageHTML));
  var profListings = $("li.listing.PROFESSOR", searchPageDOM);

  if (profListings.length == 0) {
    cacheProfMiss(profName);
    throw Error(profName + " not found.");
  }

  // for now, just use the first prof as the correct one
  var firstProfLink =
    "https://www.ratemyprofessors.com" + $("a", profListings[0]).attr("href");

  // grab the html for this professor's ranking page
  searchForRatings(firstProfLink, profName);
}

// Listen for the content script to make a rmp request
chrome.runtime.onMessage.addListener(
  function(request) {
    if (request.contentScriptQuery == "queryRatings") {
      let profName = request.profName;
      var url =
      `https://www.ratemyprofessors.com/search.jsp?queryoption=HEADER&queryBy=t
      eacherName&schoolName=University+of+Michigan&schoolID=1258&query=`
      + profName.replaceAll(" ", "+");

      fetch(url)
          .then(response => handleHttpErrors(response))
          .then(response => response.text())
          .then(text => handleQueryResponse(text, request.profName))
          .catch(function(error) {
                  console.log(error);
                  sendUnavailableProf(profName);
                }
           )

      return true;  // Will respond asynchronously.
    }
  });
