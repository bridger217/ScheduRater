// String prototype to replace all occurences, not just the first
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

// function parseRatings(rmpHTML) {
//   listings = getElementsbyClassName("listings");
//   console.log("listings: " + listings.length);
//   for (var l in listings) {
//     alert(l.listing-name.main);
//   }
// }

// Listen for the content script to make a rmp request
chrome.runtime.onMessage.addListener(
  function(request) {
    alert(request.contentScriptQuery);
    if (request.contentScriptQuery == "queryRatings") {
      alert(request.profName);
      // var url = "https://www.ratemyprofessors.com/search.jsp?query=" +
      //         request.profName.reaplaceAll(" ", "+");
      // fetch(url)
      //     .then(response => response.text())
      //     .then(text => parseRatings(text))
      //     .then(price => sendResponse(price))
      //     .catch(error => ...)
      return true;  // Will respond asynchronously.
    }
  });
