import * as chai from 'chai';
import {expect} from 'chai';
import {default as chaiHttp, request} from 'chai-http'
import app from '../../server.js'

chai.use(chaiHttp);

describe('Test running server', () => {
  it('should return 200 on GET /', (done) => {
    request.execute(app)
    	.get('/')
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });
});

