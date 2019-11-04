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

function handleRatingsResponse(ratingsPageHTML, profName) {
  var ratingsPageDOM = $($.parseHTML(ratingsPageHTML));
  var rating = $(".grade", ratingsPageDOM).text().substring(0, 4);
  // chrome.runtime.sendMessage(
  //   {
  //     contentScriptQuery: "queryRatingsReturn", profRating: rating
  //   }
  // );
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {profRating: rating, profName: profName});
  });
}

function searchForRatings(url, profName) {
  fetch(url)
    .then(response => handleHttpErrors(response))
    .then(response => response.text())
    .then(text => handleRatingsResponse(text, profName))
    .catch(error => console.log(error))

  return true;
}

function handleQueryResponse(searchPageHTML, profName) {
  var searchPageDOM = $($.parseHTML(searchPageHTML));
  var profListings = $("li.listing.PROFESSOR", searchPageDOM);

  if (profListings.length == 0) {
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
      var url =
      `https://www.ratemyprofessors.com/search.jsp?queryoption=HEADER&queryBy=t
      eacherName&schoolName=University+of+Michigan&schoolID=1258&query=`
      + request.profName.replaceAll(" ", "+");

      fetch(url)
          .then(response => handleHttpErrors(response))
          .then(response => response.text())
          .then(text => handleQueryResponse(text, request.profName))
          // .then(price => sendResponse(price))
          .catch(error => console.log(error))

      return true;  // Will respond asynchronously.
    }
  });
