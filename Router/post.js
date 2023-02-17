const router = require("express").Router()
const Post = require("../model/post")
const User = require("../model/User")
const { findById } = require("../model/User")


//new post
router.post("/", async(req, res) => {
    const newpost = new Post(req.body)
    try {
        const saved = await newpost.save()
        res.status(200).json(saved)
    } catch (err) {
        res.status(403).json(err)
    }
})

router.put("/:id", async(req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post.userId === req.body.userId) {
            await post.updateOne({ $set: req.body });
            res.status(200).json("the post has been update")
        } else {
            res.status(401).json("u can update anyone post")
        }
    } catch (err) {
        res.status(500).json("hello");
    }
})

//likes/Dislike
router.put("/:id/likes", async(req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if (!post.likes.includes(req.body.userId)) {
            await post.updateOne({ $push: { likes: req.body.userId } });
            res.status(200).json("you like the post")
        } else {
            await post.updateOne({ $pull: { likes: req.body.userId } });
            res.status(200).json("you dislike the post")
        }
    } catch (err) {
        res.status(403).json(err)
    }
})

// get the post
router.get("/:id", async(req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        res.status(200).json(post)
    } catch (err) {
        res.status(403).json(err)
    }
})

// router.get("/timeline/all", async(req, res) => {
//     try {
//         const currentUser = await User.findById(req.body.userId);
//         const userPosts = await Post.find({ userId: currentUser._id });
//         const friendPosts = await Promise.all(
//             currentUser.following.map((friendId) => {
//                 return Post.find({ userId: friendId });
//             })
//         );
//         res.status(200).json(userPosts.concat(...friendPosts));
//     } catch (err) {
//         res.status(400).json(err);
//     }
// });

router.get("/timeline/:userId", async(req, res) => {
    try {
        const currentUser = await User.findById(req.params.userId);
        const userPosts = await Post.find({ userId: currentUser._id });
        const friendPosts = await Promise.all(
            currentUser.follower.map((friendId) => {
                return Post.find({ userId: friendId });
            })
        );
        res.status(200).json(userPosts.concat(...friendPosts));
    } catch (err) {
        res.status(500).json(err);
    }
});

router.get("/profile/:username", async(req, res) => {
    try {
        const currentUser = await User.findOne({ username: req.params.username });
        const userPosts = await Post.find({ userId: currentUser._id });

        res.status(200).json(userPosts);
    } catch (err) {
        res.status(400).json(err);
    }
});

// router.get("/profile/:username", async(req, res) => {
//     try {
//         const curruser = await User.findById({ username: req.params.username });
//         const currpost = await Post.find({ userId: curruser._id });
//         res.status(200).json(currpost)
//     } catch (err) {
//         res.status(400).json(err);
//     }
// })
module.exports = router