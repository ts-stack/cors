import EventEmitter from 'events';
import { AnyObj } from '../src/main';

export class FakeResponse extends EventEmitter {
  private _headers: AnyObj = {};
  statusCode = 200;

  end() {
    process.nextTick(() => {
      this.emit('finish');
    });
  }

  getHeader(name: string) {
    const key = name.toLowerCase();
    return this._headers[key];
  }

  setHeader(name: string, value: string) {
    const key = name.toLowerCase();
    this._headers[key] = value;
  }
}
