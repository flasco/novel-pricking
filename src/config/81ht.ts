export = {
  site: 'www.81ht.com',
  charset: 'gbk',
  search: {
    method: 'get',
    pattern: 'http://www.81ht.com/search.htm?keyword=${key}',
    closeEncode: true,
    bookList: 'id.novel-list@tag.li',
    bookUrl: 'tag.div:nth-child(2)@tag.a@href',
    bookName: 'tag.div:nth-child(2)@tag.a@text',
    latestChapter: '',
    author: 'tag.div:nth-child(4)@text',
  },
  detail: {
    latest: "tag.meta[property='og:novel:latest_chapter_name']@content",
    description: "tag.meta[property='og:description']@content",
    imageUrl: "tag.meta[property='og:image']@content",
    catalogUrl: 'class.btn btn-danger@href',
    author: "tag.meta[property='og:novel:author']@content",
    name: "tag.meta[property='og:novel:book_name']@content",
  },
  list: {
    chapters: 'id.chapters-list@tag.a',
    title: 'text',
    href: 'href',
  },
  chapter: {
    title: 'tag.h1@text',
    content: 'id.txtContent@text##请记住本书.*.com',
  },
};
