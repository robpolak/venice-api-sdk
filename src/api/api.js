'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.VeniceAPI = void 0;
const models_1 = require('./impl/models');
const chat_1 = require('./impl/chat');
const images_1 = require('./impl/images');
class VeniceAPI {
  constructor(core) {
    this.core = core;
    this.models = new models_1.ModelsApi(this.core);
    this.chat = new chat_1.ChatApi(core);
    this.images = new images_1.ImagesApi(this.core);
  }
}
exports.VeniceAPI = VeniceAPI;
