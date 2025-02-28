const express=require("express");
const morgan=require("morgan");
const app=express();
const http = require('http');
require('dotenv').config()
const cors=require('cors');
const PORT = process.env.PORT || 3001
const Person=require('./models/person.js')

app.use(express.json())
app.use(cors())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post-data'))
app.use(express.static('dist'))
morgan.token('post-data', (req, res) => {
    return req.method === 'POST' ? JSON.stringify(req.body) : ''
  })

// let phonebook=[
//     { 
//       "id": "1",
//       "name": "Arto Hellas", 
//       "number": "040-123456"
//     },
//     { 
//       "id": "2",
//       "name": "Ada Lovelace", 
//       "number": "39-44-5323523"
//     },
//     { 
//       "id": "3",
//       "name": "Dan Abramov", 
//       "number": "12-43-234345"
//     },
//     { 
//       "id": "4",
//       "name": "Mary Poppendieck", 
//       "number": "39-23-6423122"
//     }
// ]

// app.get("/api/persons", (req, res) => {res.json(phonebook)})
// app.get("/info", (req, res) => {
//     const currentTime = new Date()
//     res.send(`
//         <p>Phonebook has info for ${phonebook.length} people</p>
//         <p>Current time is: ${currentTime.toISOString()}</p>        
//         `)})
// app.get("/api/persons/:id",(req,res)=>{
//     const id=req.params.id
//     const person=phonebook.find(p=>p.id===id)
//     if(person){
//         res.json(person)
//     }else{
//         res.status(404).send()
//     }
// })
// app.delete("/api/persons/:id",(req,res)=>{
//     const id=req.params.id
//     phonebook = phonebook.filter(person => person.id !== id)

//     res.status(204).end()
// })
// app.post("/api/persons",(req,res)=>{
//     const body=req.body
//     if(!body.name || !body.number){
//         return res.status(400).json({error: "Name and number are required"})
//     }
//     if(phonebook.some(person=>person.name===body.name)){
//         return res.status(400).json({error: "Name must be unique"})
//     }
//     const newId=Math.floor(Math.random()*100000)
//     const person={id:newId.toString(),name:body.name,number:body.number}
//     phonebook=phonebook.push(person)
//    res.json(person)
// })
// const PORT = 3001
// app.listen(PORT)
// console.log(`Server running on port ${PORT}`)
app.get('/api/persons',(req, res)=>{
  Person.find({}).then(persons=>{
    res.json(persons)
  })
})
app.get("/info", (req, res) => {
  const currentTime = new Date()
  res.send(`
      <p>Phonebook has info for ${Person.length} people</p>
      <p>Current time is: ${currentTime.toISOString()}</p>        
      `)})
app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })

    .catch(error => next(error))
})
app.post('/api/persons', (request, response,next) => {
  const body = request.body

  // if (body.name === undefined) {
  //   return response.status(400).json({ error: 'name missing' })
  // }
  // if (body.number === undefined) {
  //   return response.status(400).json({ error: 'number missing' })
  // }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save().then(savedPerson => {
    response.json(savedPerson)
  })
  .catch(error => next(error))
})
app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})
app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person= {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// handler of requests with unknown endpoint
app.use(unknownEndpoint)
// const errorHandler = (error, request, response, next) => {
//   console.error(error.message)

//   if (error.name === 'CastError') {
//     return response.status(400).send({ error: 'malformatted id' })
//   } 
//   if (error.name === 'ValidationError') {
//     return response.status(400).json({ error: error.message });
//   } 

//   next(error)
// }
// const errorHandler = (error, request, response, next) => {
//   console.error('ERROR MESSAGE:', error.message);

//   if (error.name === 'CastError') {
//     return response.status(400).send({ error: 'malformatted id' });
//   } else if (error.name === 'ValidationError') {
//     return response.status(400).json({ error: error.message });
//   } 

//   next(error);
// };

// // this has to be the last loaded middleware, also all the routes should be registered before this!
// app.use(errorHandler);
const errorHandler = (error, request, response, next) => {

  if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message }); 
  }

  next(error);
};

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })