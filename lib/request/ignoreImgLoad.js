module.exports = request => {
  if (
    ['image', 'stylesheet', 'font', 'script'].indexOf(
      request.resourceType()
    ) !== -1
  ) {
    request.abort();
  } else {
    request.continue();
  }
}