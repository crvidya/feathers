var feathers = require('../../lib/feathers');
var Proto = require('uberproto');
var express = require('express');

// Services

var users = feathers.service.mongodb({ collection: 'users' });
var posts = feathers.service.mongodb({ collection: 'posts' });
var comments = feathers.service.mongodb({ collection: 'comments' });

// Mixins
Proto.mixin(require('../../lib/mixins/event'), users);
Proto.mixin(require('../../lib/mixins/event'), posts);
Proto.mixin(require('../../lib/mixins/event'), comments);

Proto.mixin(require('../../lib/mixins/association'), users);
Proto.mixin(require('../../lib/mixins/association'), posts);
Proto.mixin(require('../../lib/mixins/association'), comments);

// Associations
users.has({
  posts: ['posts'],
  comments: ['comments']
});

posts.has({
  author: 'users',
  comments: ['comments']
});

comments.has({
  author: 'users',
  post: 'posts'
});

var associations = {
  'users': [
    {
      hasMany: 'posts',
      key: 'author'
    },
    {
      hasMany: 'comments',
      key: 'author'
    }
  ],
  'posts': [
    {
      hasMany: 'comments',
      key: 'post'
    },
    {
      hasOne: 'users',
      key: 'id'
    }
  ],
  'comments': {
    hasOne: 'users',
    key: 'id'
  }
};

function has (association){
  if (hasMany){
    associations[association.key] = association.value;
  }
}

// {
//   "title": "The great novel",
//   "author": "1",
//   "body": "Lorem ipsum",
//   "comments": []
// }

// Create Server
feathers.createServer()
  .use(express.static(__dirname))
  .service('users', users)
  .service('posts', posts)
  .provide(feathers.rest())
  .provide(feathers.socketio())
  .start();