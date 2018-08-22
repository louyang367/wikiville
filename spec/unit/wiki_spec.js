const sequelize = require("../../src/db/models/index").sequelize;
const Wiki = require("../../src/db/models").Wiki;
const User = require("../../src/db/models").User;

describe('Wiki', () => {
  beforeEach((done) => {
    this.wiki;
    this.user;

    sequelize.sync({ force: true }).then((res) => {
      User.create({
        name: 'John Doe',
        email: 'abc@testing.com',
        password: '123456',
      }).then(user => {
        this.user = user;
        Wiki.create({
          title: 'test111111',
          body: 'body11111',
          userId: user.id
        }).then(wiki => {
          this.wiki = wiki;
          done();
        })
      }).catch((err) => {
        console.log(err);
        done();
      })
    })
  });

  describe('#index()', () => {
    it('should return both wikis inserted', (done) => {
      Wiki.create({
        title: 'test22222',
        body: 'body22222',
        userId: this.user.id
      }).then(wiki => {
        Wiki.all()
          .then(wikis => {
            expect(wikis.length).toBe(2);
            expect(wikis[0].title).toBe(this.wiki.title);
            expect(wikis[0].body).toBe(this.wiki.body);
            expect(wikis[0].userId).toBe(this.wiki.userId);
            done();
          })
      })
        .catch((err) => {
          console.log(err);
          done();
        })
    })
  })
})