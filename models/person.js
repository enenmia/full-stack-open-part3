// this fiel contain the connection to database
const mongoose = require('mongoose')
require('dotenv').config()
mongoose.set('strictQuery', false)


const url = process.env.MONGODB_URI


console.log('connecting to', url)

mongoose.connect(url)

  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch(error => {
    console.log('error connecting to MongoDB:', error.message)
  })

// const personSchema = new mongoose.Schema({
//   name: String,
//   number: String,
// })
//edit
const phoneValidator = (value) => {
  return /^\d{2,3}-\d+$/.test(value);
};
const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: [3, 'Name must be at least 3 characters long'],
    required: [true, 'Name is required']
  },
  number: {
    type: String,
    required: [true, 'Phone number is required'],
    validate: {
      validator: phoneValidator,
      message: 'Phone number must be in format XX-YYYYYYY or XXX-YYYYYYYY'
    }
  }
});

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})


module.exports = mongoose.model('Person', personSchema)