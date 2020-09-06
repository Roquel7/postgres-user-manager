const express = require('express')
const app = express()
const path = require('path')
const port = 4000
const fs = require('fs')
const { v4: uuidv4 } = require('uuid')
const pg = require('pg')

const client = new pg.Client('postgres://postgres:Fc7barcelona@localhost:5432/userManager')

client.connect()

app.use(express.json())
app.use(express.urlencoded({extended: false}))

app.set('views', './views')
app.set('view engine', 'pug')

app.get('/', (req, res) => {
    res.render('index.pug', {
        title: 'User Manager',
        subTitle: 'Adding Students',
    })
})

app.post('/addingStudent', (req, res) => {

    client.query('insert into users (age, first_name, id, last_name, email) values ($1, $2, $3, $4, $5)', [req.body.age, req.body.first_name, uuidv4(), req.body.last_name, req.body.email], 
                
                (err, data) => {
                    if (err) console.log(err)
                    res.redirect('/studentList')
                }
            )
})

app.get('/studentList', async (req, res) => {
    client.query('select * from users', (err, data) => {
        if (err) console.log(err)
        console.log(data.rows)
        res.render('userPage.pug', {
            users: data.rows
        })
    })
})

app.get('/editUser/:edit', async (req, res) => {
    client.query('select * from users where id = $1',[req.params.edit], (err, data) => {
        if (err) console.log(err)
        console.log(data)
        res.render('editUser.pug', {
            users: data.rows
        })
    })
})

app.post('/editUser/:edit', async (req, res) => {

    const {first_name: newFirstName, last_name: newLastName, age: newAge, email: newEmail} = req.body

    client.query('update users set (age, first_name, id, last_name, email) = ($1, $2, $3, $4, $5) where id = $3' , [newAge, newFirstName, req.params.edit, newLastName, newEmail], (err, data) => {
        if(err) console.log(err)
        res.redirect('/studentList')
    })
})

app.post('/searchedStudent', async (req, res) => {


    client.query('select * from users where last_name = $1', [req.body.findLastName], (err, data) => {
        if (err) console.log(err)
        console.log(data)
        res.render('searchedStudents.pug', {
            users: data.rows
        })
    })

})

app.post('/ascendingOrder', async (req, res) => {
    client.query('select * from users order by last_name ASC', (err, data) => {
        res.render('userPage.pug', {
            users: data.rows
        })
    })
})

app.post('/descendingOrder', async (req, res) => {
    client.query('select * from users order by last_name DESC', (err, data) => {
        res.render('userPage.pug', {
            users: data.rows
        })
    })
})

app.post('/removeUser/:delete', async (req, res) => {
    client.query('delete from users where id = $1', [req.params.delete], (err, data) => {
        if (err) console.log(err)
        res.redirect('/studentList')
    })
})

app.listen(port, err => {
    if (err) throw err;
    console.log('Listening on port 4000')
})
