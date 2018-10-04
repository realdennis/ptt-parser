function articleParser() {
  function getPostInfo() {
    let obj = {
      author: 'unknown',
      board: 'unknown',
      title: 'unknown',
      time: undefined
    };
    let values = document.querySelectorAll('.article-meta-value');
    if (!values) return obj;
    if (values[0]) obj.author = values[0].innerText;
    if (values[1]) obj.board = values[1].innerText;
    if (values[2]) obj.title = values[2].innerText;
    if (values[3]) obj.time = (values[3].innerText);
    return obj;
  }
  function getPushInfo() {
    let obj = {
      like: [],
      dislike: [],
      arrow: []
    };
    document.querySelectorAll('.push').forEach(push => {
      //console.log(push.firstChild.innerText)
      if (!push.children[0]) return;
      let tag = push.children[0].innerText[0];
      if (tag === '推') tag = 'like';
      else if (tag === '噓') tag = 'dislike';
      else if (tag === '→') tag = 'arrow';
      else tag = 'unknown';

      let iptime;
      if (push.children[3])
        iptime = /(.*)\s?(\d{2}\/\d{2}\s\d{2}\:\d{2})/.exec(
          push.children[3].innerText
        );
      obj[tag].push({
        id: push.children[1] ? push.children[1].innerText : 'unknown',
        comment: push.children[2] ? push.children[2].innerText : 'unknown',
        ip: iptime ? iptime[1] : ' ',
        time: iptime ? (iptime[2]) : ('01/01 00:00')
      });
    });
    // api get length convenience
    obj.likeCount = obj.like.length;
    obj.dislikeCount = obj.dislike.length;
    obj.arrowCount = obj.arrow.length;
    return obj;
  }

  function getContent() {
    let el = document.querySelector('#main-content'),
      child = el.firstChild,
      texts = [],
      links = [],
      images = [];
    while (child) {
      if (child.tagName === 'A') {
        links.push(child.innerText);
        if (/\.(jpg|png|gif)/.test(child.innerText))
          images.push(child.innerText);
      }
      if (child.nodeType == 3) {
        texts.push(child.data);
      }
      child = child.nextSibling;
    }

    let text = texts.join('');
    return {
      text: text,
      link: links,
      image: images
    };
  }
  return {
    postInfo: getPostInfo(),
    pushInfo: getPushInfo(),
    contentInfo: getContent()
  };
}
module.exports = articleParser;
