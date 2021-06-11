const express = require('express')

const {
    createTeacher,
    signInTeacher,
    createClass
} = require('../services/teacher')

const teacherAuth = require('../middleware/teacher_auth')

const router = new express.Router()

router.post('/teacher/signup', async (req, res) => {

    try {

        // gets the jwt token after creating the user
        const token = await createTeacher(
            req.body.firstname,
            req.body.lastname,
            req.body.email,
            req.body.password)

        // sets the jwt token as cookie and responds with 201 status.
        // We can also send a redirect request from here    
        res.cookie("jwt", token).status(201).send()

    } catch (e) {

        // if email is already taken,
        // postgres responds with error code 23505
        if (e.code === '23505') {
            return res.status(409).send()
        }

        console.log(e)

        // for any other error
        res.status(400).send()

    }
})

router.post('/teacher/signin', async (req, res) => {

    try {

        const token = await signInTeacher(
            req.body.email,
            req.body.password)

        // token is null when email id is not found or password is incorrect
        if (token == null) {

            return res.status(401).send()
        }

        // when password is correct
        res.cookie("jwt", token).status(200).send()

    } catch (e) {

        // for any other error
        console.log(e)

        res.status(400).send()

    }
})

router.post('/class/create', teacherAuth, async (req, res) => {

    try {

        // extract the teacher id passed by the teacher Auth middleware
        const teacherID = res.locals.id
        await createClass(teacherID, req.body.subject)

        // when the class was created successfully 
        res.status(201).send()

    } catch (e) {
        console.log(e)
        // if any error
        res.status(400).send()

    }
})

module.exports = router