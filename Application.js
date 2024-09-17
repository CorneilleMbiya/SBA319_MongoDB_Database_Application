const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/mydatabase', { useNewUrlParser: true, useUnifiedTopology: true });

// User Schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    age: { type: Number, min: 0 }
});
userSchema.index({ email: 1 }); // MongoDB Index

const User = mongoose.model('User', userSchema);

// Post Schema
const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});
postSchema.index({ title: 1 }); // MongoDB Index

const Post = mongoose.model('Post', postSchema);

// Comment Schema
const commentSchema = new mongoose.Schema({
    content: { type: String, required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});
commentSchema.index({ post: 1 }); // MongoDB Index

const Comment = mongoose.model('Comment', commentSchema);

// Sample Data Creation
async function createSampleData() {
    const users = await User.insertMany([
        { name: 'Alice', email: 'alice@example.com', age: 30 },
        { name: 'Bob', email: 'bob@example.com', age: 25 },
        { name: 'Charlie', email: 'charlie@example.com', age: 35 },
        { name: 'David', email: 'david@example.com', age: 28 },
        { name: 'Eve', email: 'eve@example.com', age: 22 }
    ]);

    const posts = await Post.insertMany([
        { title: 'Post 1', content: 'Content of Post 1', author: users[0]._id },
        { title: 'Post 2', content: 'Content of Post 2', author: users[1]._id },
        { title: 'Post 3', content: 'Content of Post 3', author: users[2]._id },
        { title: 'Post 4', content: 'Content of Post 4', author: users[3]._id },
        { title: 'Post 5', content: 'Content of Post 5', author: users[4]._id }
    ]);

    await Comment.insertMany([
        { content: 'Comment 1', post: posts[0]._id, author: users[1]._id },
        { content: 'Comment 2', post: posts[1]._id, author: users[2]._id },
        { content: 'Comment 3', post: posts[2]._id, author: users[3]._id },
        { content: 'Comment 4', post: posts[3]._id, author: users[4]._id },
        { content: 'Comment 5', post: posts[4]._id, author: users[0]._id }
    ]);
}

// CRUD Routes
const createCRUDRoutes = (model, name) => {
    app.get(`/${name}`, async (req, res) => {
        const data = await model.find().populate('author');
        res.json(data);
    });

    app.post(`/${name}`, async (req, res) => {
        const item = new model(req.body);
        await item.save();
        res.status(201).json(item);
    });

    app.patch(`/${name}/:id`, async (req, res) => {
        const item = await model.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(item);
    });

    app.delete(`/${name}/:id`, async (req, res) => {
        await model.findByIdAndDelete(req.params.id);
        res.status(204).send();
    });
};

createCRUDRoutes(User, 'users');
createCRUDRoutes(Post, 'posts');
createCRUDRoutes(Comment, 'comments');

// Start Server
app.listen(4040, () => {
    console.log('Server is running on port 4040');
    createSampleData();
});