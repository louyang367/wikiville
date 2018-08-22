const request = require("request");
const server = require("../../src/server");
const base = "http://localhost:3000/";
const sequelize = require("../../src/db/models/").sequelize;
const User = require("../../src/db/models/").User;
const Wiki = require("../../src/db/models/").Wiki;

describe('routes: wikis', ()=>{
  beforeEach((done)=>{
    this.user;
    this.wiki;

    sequelize.sync({force:true}).then(()=>{
      User.create({
        name: 'whoami',
        email: 'abc@mouse.com',
        password: '123456'
      }).then(user=>{
        this.user = user;
        Wiki.create({
          title: 'testing',
          body:'do this one more time',
          userId: user.id
        }).then(wiki=>{
          this.wiki = wiki;
          done();
        }).catch(err=>{
          console.log(err);
          done();
        })
      })
    })
  })

  describe('admin performing CRUD', ()=>{
    beforeEach(done=>{
      request.get({
        url: "http://localhost:3000/auth/fake",//base+'auth/fake', 
        form: {
          userId: 999,
          email: 'admin@test.com',
          name: 'admin',
          role: User.ADMIN
        }
      }, (err, res, body)=>{
        if (err) console.log(err);
        done();
      })
    });

    describe('POST /wikis/:id/destroy', ()=>{
      it ('should delete the wiki', (done)=>{
        request.post(`${base}wikis/${this.wiki.id}/destroy`, (err, res, body)=>{
          if (err) console.log(err);
          expect(err).toBe(null);
          Wiki.findById(this.wiki.id).then((wiki)=>{
            console.log('--------',wiki.title);
            expect(wiki).toBe(null);
            done();
          }).catch(err=>{
            expect(err).not.toBe(null);
            done();
          })
        })
      })
    })
  })

})