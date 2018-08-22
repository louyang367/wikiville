//const staticController = require('../../src/controllers/staticController');
const server = require("../../src/server");
const request = require('request');

describe('Routes: static',()=>{
  it("GET / should display 'Wikiville: Social, Markdown Wikis'", (done)=>{
    request.get("http://localhost:3000/", (err, res, body)=>{
      if (err) console.log(err);  
      expect(res.statusCode).toBe(200);
      expect(body).toContain('Wikiville: Social, Markdown Wikis');
      done();
    })
  })
})