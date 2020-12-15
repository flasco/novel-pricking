export = {
  site: 'http://www.bxwx66.com',
  charset: 'UTF-8',
  search: {
    method: 'post',
    pattern: 'http://www.bxwx66.com/search.html?searchtype=all&searchkey=${key}',
    bookList: 'id.sitembox@tag.dl',
    bookName: 'tag.h3@tag.a@text',
    bookUrl: 'tag.h3@tag.a@href',
    latestChapter: 'class.book_other@tag.a@text',
    author: 'class.book_other@tag.span:nth-child(1)@text',
  },
  list: {
    chapters: 'id.list@tag.dd@tag.a',
    title: 'text',
    href: 'href',
  },
  detail: {
    latest: "tag.meta[property='og:novel:latest_chapter_name']@content",
    description: "tag.meta[property='og:description']@content",
    imageUrl: "tag.meta[property='og:image']@content",
    author: "tag.meta[property='og:novel:author']@content",
    name: "tag.meta[property='og:novel:book_name']@content",
  },
  chapter: {
    title: 'tag.h1@text',
    content: 'id.content@text##(.未完待.*?版阅读！.)|(因某些原.*?的路！)|(喜欢.*?速度最快。)',
  },
};
