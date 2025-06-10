import sinon from 'sinon'
import {expect} from 'chai'

import axios from 'axios'

async function fetchData(){
	const response = await axios.post('http://localhost:3001/api/auth/signup')
	// console.log(response.data)
	return response.data
}

describe('API Service Test',()=>{
	it('Should return the submitted data.',async()=>{
		const mockData = {data:{name:'rod',email:'invalidEmail',password:'whatEver'}};
		sinon.stub(axios,'post').resolves({data:mockData});

		const result = await fetchData();
		// console.log({result})
		expect(result).to.eql(mockData);
		axios.post.restore();
	})
})