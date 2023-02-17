const router = require("express").Router()
const User = require("../model/User")
const bcrypt = require("bcrypt")

// router.get("/", function(req, res) {
//     res.send("thello")
// })
// get friends

router.get("/friends/:userId", async(req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        const friends = await Promise.all(
            user.follower.map(friendID => {
                return User.findById(friendID);
            })
        );
        let friendlist = [];
        friends.map((friend) => {
            const { _id, username, profile } = friend;
            friendlist.push({ _id, username, profile });
        });
        res.status(200).json(friendlist);
    } catch (err) {
        res.status(500).json(err);
    }
})

//update
router.put("/:id", async(req, res) => {
    if (req.body.userId === req.params.id || req.body.isAdmin) {
        if (req.body.password) {
            try {
                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(req.body.password, salt);
            } catch (err) {
                return res.status(500).json(err);
            }
        }
        try {
            const user = await User.findByIdAndUpdate(req.params.id, {
                $set: req.body,
            });
            res.status(200).json("Account has been updated");
        } catch (err) {
            return res.status(500).json(err);
        }
    } else {
        return res.status(403).json("You can update only your account!");
    }
});


//delete
router.delete("/:id", async(req, res) => {
    if (req.body.userId === req.params.id || req.body.isAdmin) {
        try {
            await User.findByIdAndDelete(req.params.id)
            res.status(200).json("Acoount Deleted");
        } catch (err) {
            return res.status(500).json(err);
        }
    } else {
        return res.status(403).json("You can update only your account!");
    }
});

//get specific detail

router.get("/:id", async(req, res) => {
    try {
        const user = await User.findById(req.params.id);
        res.status(200).json(user);
    } catch (err) {
        return res.status(500).json(err)
    }


})
router.get("/", async(req, res) => {
    const userId = req.query.userId;
    const username = req.query.username;
    try {
        const user = userId ?
            await User.findById(userId) :
            await User.findOne({ username: username });
        const { password, updatedAt, ...other } = user._doc;
        res.status(200).json(other);
    } catch (err) {
        res.status(500).json(err);
    }
});

//follow
router.put("/:id/follow", async(req, res) => {
    if (req.body.userId !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            const currentuser = await User.findById(req.body.userId);
            if (!user.follower.includes(currentuser)) {
                await user.updateOne({ $push: { follower: req.body.userId } })
                await currentuser.updateOne({ $push: { following: req.params.id } })
                res.status(200).json("you followed ")
            } else {
                res.status(403).json("you already followed")
            }
        } catch (err) {
            res.status(500).json(err)
        }
    } else {
        return res.status(403).json("You cann't follow your self");
    }
});

// unfollow
router.put("/:id/unfollow", async(req, res) => {
    if (req.body.userId !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            const currentuser = await User.findById(req.body.userId);
            if (user.follower.includes(req.body.userId)) {
                await user.updateOne({ $pull: { follower: req.body.userId } })
                await currentuser.updateOne({ $pull: { following: req.params.id } })
                res.status(200).json("you unfollowed ")
            } else {
                res.status(403).json("you already unfollowed")
            }
        } catch (err) {
            res.status(500).json(err)
        }
    } else {
        return res.status(403).json("You cann't unfollow your self");
    }
});



module.exports = router