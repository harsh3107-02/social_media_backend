const Auth = require("express").Router();
const User = require("../model/User")
const bcrypt = require("bcrypt")


// Auth.get("/register", function(req, res) {
//     const user = new User({
//         username: "harsh",
//         email: "harsh@gmail.com",
//         password: "harsh"
//     })
//     user.save()
//     res.send("ok")
// })

Auth.post("/register", async(req, res) => {
    try {
        //generate hased password
        const { username, email, password } = req.body
        const salt = await bcrypt.genSalt(10);
        const hasedpassword = await bcrypt.hash(password, salt);


        //create user
        const newuser = new User({
            username: username,
            email: email,
            password: hasedpassword
        })

        //saving into database
        const user2 = await User.findOne({ email: email })
        if (user2) {
            res.status(404).json("already User");
        } else {
            const user = newuser.save()
            res.status(200).json(user);
        }
    } catch (error) {
        res.status(500).json(error)
    }
})

Auth.post("/login", async(req, res) => {
    try {
        const { email } = req.body;
        const { password } = req.body;
        const user = await User.findOne({ email: email });
        // !user && res.status(404).json("not found");
        if (!user) {
            return res.status(402).json({ message: "wrong" })
        }

        const validpassword = await bcrypt.compare(password, user.password);
        if (!validpassword) {
            return res.status(401).json({ message: 'Username or password is incorrect' });
        }
        res.status(200).json(user)
    } catch (err) {
        res.status(500).json(err)
    }
})





module.exports = Auth