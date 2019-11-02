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

function handleRatingsResponse(ratingsPageHTML) {
  var ratingsPageDOM = $($.parseHTML(ratingsPageHTML));
  var rating = $(".grade", ratingsPageDOM).text().substring(0, 4);
  alert(rating);
}

function searchForRatings(url) {
  fetch(url)
    .then(response => handleHttpErrors(response))
    .then(response => response.text())
    .then(text => handleRatingsResponse(text))
    .catch(error => console.log(error))

  return true;
}

function handleQueryResponse(searchPageHTML) {
  var searchPageDOM = $($.parseHTML(searchPageHTML));
  var profListings = $("li.listing.PROFESSOR", searchPageDOM);

  if (profListings.length == 0) {
    throw Error("No professors found.");
  }

  // for now, just use the first prof as the correct one
  var firstProfLink =
    "https://www.ratemyprofessors.com" + $("a", profListings[0]).attr("href");

  // grab the html for this professor's ranking page
  searchForRatings(firstProfLink);


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
          .then(text => handleQueryResponse(text))
          // .then(price => sendResponse(price))
          .catch(error => console.log(error))

      return true;  // Will respond asynchronously.
    }
  });
