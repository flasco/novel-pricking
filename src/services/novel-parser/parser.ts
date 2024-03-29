import iconv from 'iconv-lite';
import urlencode from 'urlencode';

import nrc from './novel-request';

import { htmlAnalysis } from '@app/utils/quert';
import type { ISiteConfig } from '@app/definitions/config';
import type { ISearchItem } from '@app/definitions/novel';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
iconv.skipDecodeWarning = true;

class BaseParser {
  config: ISiteConfig;

  constructor(config: ISiteConfig) {
    this.config = config;
    if (!this.config) {
      throw Error('unsupported site');
    }
  }

  async getPageContent(url: string, { useCache = true, headers = {}, timeout = 5000 } = {}) {
    const res = await nrc.push(
      {
        url,
        method: 'get',
        timeout,
        headers,
      },
      useCache
    );
    return iconv.decode(res, this.config.charset);
  }

  async getPostContent({
    url,
    timeout = 5000,
    headers,
  }: {
    url: string;
    timeout?: number;
    headers?: any;
  }) {
    const [newUrl, qstring] = url.split('?');
    const res = await nrc.push(
      {
        method: 'post',
        headers,
        url: newUrl,
        data: qstring,
        timeout,
      },
      true
    );
    return iconv.decode(res, this.config.charset);
  }

  async getChapterList(url: string) {
    const { list } = this.config;

    const content = await this.getPageContent(url);

    const chapters = htmlAnalysis(content, list.chapters);

    const novelList = [];
    const hrefSet = new Set();
    for (let i = chapters.length - 1; i >= 0; i--) {
      const item = chapters[i];
      const title = htmlAnalysis(item, list.title) as string;
      const href = htmlAnalysis(item, list.href) as string;
      if (title.length < 1 || href == null) {
        continue;
      }
      const curHref = new URL(href, url).toString().replace(/(.*)(\/.*\/){2}(.*)/, '$1$2$3');
      if (!hrefSet.has(curHref)) {
        novelList.push({
          title,
          url: curHref,
        });
        hrefSet.add(curHref);
      }
    }

    hrefSet.clear();
    return novelList.reverse();
  }

  async getLatestChapter(url: string) {
    const res = await this.getPageContent(url);
    return htmlAnalysis(res, this.config.detail.latest);
  }

  async getChapterDetail(url: string) {
    let res = await this.getPageContent(url);

    res = res
      .replace(/&nbsp;/g, '')
      .replace(/<br>/g, '${line}')
      .replace(/<br \/>/g, '${line}')
      .replace(/<br\/>/g, '${line}');

    const { chapter } = this.config;
    const base = htmlAnalysis(res);
    const asContent = htmlAnalysis(base, chapter.content) as string;

    const text = asContent
      .replace(/\${line}/g, '\n')
      .replace(/[ ]+/g, '')
      .replace(/[　]+/g, '')
      .replace(/\n+/g, '\n')
      .replace(/\t+/g, '');

    const ret = {
      title: htmlAnalysis(base, chapter.title),
      content: text,
      prevUrl: '',
      nextUrl: '',
    };

    if (chapter.nextUrl) {
      const asPrevHref = htmlAnalysis(base, chapter.prevUrl) as string;
      const asNextHref = htmlAnalysis(base, chapter.nextUrl) as string;
      ret.prevUrl = asPrevHref ? new URL(asPrevHref, url).toString() : '';
      ret.nextUrl = asNextHref ? new URL(asNextHref, url).toString() : '';
    }

    return ret;
  }

  get canSearch() {
    return this.config.search != null;
  }

  async search(keyword: string) {
    const { search, charset } = this.config;
    const { pattern, method, closeEncode, customHeader } = search;

    const preHeader = customHeader ? JSON.parse(customHeader) : {};

    const searchUrl = pattern.replace(
      '${key}',
      urlencode.encode(keyword, closeEncode ? 'utf-8' : charset)
    );

    let res;
    if (method === 'post') {
      res = await this.getPostContent({ url: searchUrl, headers: preHeader });
    } else {
      res = await this.getPageContent(searchUrl);
    }

    // TODO: 可以考虑兼容一下特定搜索词直接进入指定书籍页面，没走列表的场景（看看目标的url是否符合书籍规则）

    const searchList: ISearchItem[] = [];
    const list = htmlAnalysis(res, search.bookList);
    for (let i = 0; i < list.length; i++) {
      const item = list[i];
      const name = htmlAnalysis(item, search.bookName) as string;
      const author = htmlAnalysis(item, search.author) as string;
      const href = htmlAnalysis(item, search.bookUrl) as string;
      if (href == null || name.length < 1) {
        continue;
      }
      const payload = {
        bookName: name,
        bookUrl: new URL(href, searchUrl).toString(),
        author,
        latestChapter: undefined,
      };
      if (search.latestChapter !== '') {
        payload.latestChapter = htmlAnalysis(item, search.latestChapter);
      }
      searchList.push(payload);
    }
    return searchList;
  }

  /** 获取书籍详情 */
  async getBookDetail(url: string) {
    const { latest, description, imageUrl, catalogUrl, author, name } = this.config.detail;
    const res = await this.getPageContent(url);

    const base = htmlAnalysis(res);

    const payload = {
      latest: htmlAnalysis(base, latest),
      desc: (htmlAnalysis(base, description) as string).trim(),
      name: htmlAnalysis(base, name),
      author: htmlAnalysis(base, author),
      image: new URL(htmlAnalysis(base, imageUrl) as string, this.config.site).toString(),
      url,
      catalogUrl: url,
    };

    if (catalogUrl != null && catalogUrl !== '') {
      payload.catalogUrl = new URL(
        htmlAnalysis(base, catalogUrl) as string,
        this.config.site
      ).toString();
    }

    return payload;
  }
}

export = BaseParser;
