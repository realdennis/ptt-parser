function pageInfo() {
  function getPrev() {
    let prevLink = '';
    document.querySelectorAll('.btn,.wide').forEach(button => {
      if (button.innerText.includes('上頁')) prevLink = button.href;
    });
    return prevLink;
  }
  function getPageNumber() {
    let prev = getPrev();
    if (prev === '') return 1;
    //console.log(prev);
    if (!/index(\d*)\.html/.test(prev)) return 'error';
    let prevPageNumber = /index(\d*)\.html/.exec(prev)[1];
    return Number(prevPageNumber) + 1;
  }
  function linkParser() {
    let link = [];
    document.querySelectorAll('.title>a').forEach(a => {
      if (a.innerText.includes('公告')) return;
      link.push({
        title: a.innerText,
        link: a.href
      });
    });
    return link;
  }
  return {
    prevPage: getPrev(),
    pageNumber: getPageNumber(),
    links: linkParser()
  };
}
module.exports = pageInfo;
