import { AnyObj } from '../src/main';

export class FakeRequest {
  constructor(public method?: string, public headers?: AnyObj) {
    this.headers = headers || {
      origin: 'http://example.com',
      'access-control-request-headers': 'x-header-1, x-header-2',
    };
    this.method = method || 'GET';
  }
}
