import { Controller, Get } from 'pricking-koa/dist/utils/decorator';

import BaseController from '@app/controllers/common/IndexController';

import nrc from '@app/services/novel-parser/novel-request';

@Controller('cat')
class IndexController extends BaseController {
  @Get('say')
  async speak() {
    const { query } = this.ctx;
    this.validator.required(query.url);
    const result = await nrc.push(query.url);
    this.ctx.success(result);
  }
}

export = IndexController;
