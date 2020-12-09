import { Controller, Get } from '@flasco/pricking-koa/dist/utils/decorator';

import BaseController from '@app/controllers/common/IndexController';
import { delay } from '@app/utils';

@Controller('cat')
class IndexController extends BaseController {
  @Get('say')
  async speak() {
    await delay(1000);
    this.ctx.success({ e: 123 });
  }
}

export = IndexController;
