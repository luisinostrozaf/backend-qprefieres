import express from 'express';
import cors from 'cors'; 
import mongoose from 'mongoose';

const app = express();
 
app.use(express.json());
const corsOptions = {
  origin: '*', // This will allow all origins
  optionsSuccessStatus: 200 // For legacy browser support
}

app.use(cors(corsOptions));

mongoose.connect('mongodb+srv://luisinostrozaf:iQs8jiobZlqlBmma@qpbackend.dpi1eon.mongodb.net/qprefieres?retryWrites=true&w=majority&appName=QPBackend');

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("We're connected to the database!");
});

app.get('/', (req, res) => {
  res.send('Welcome to the API!');
});

const port = 3000; 

const questionSchema = new mongoose.Schema({
  id: Number,
  option1: String,
  option2: String,
  opt1_times_clicked: Number,
  opt2_times_clicked: Number
});

const QuestionDocumentSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  question: [questionSchema]
});

const Question = mongoose.model('Question', QuestionDocumentSchema, 'questions');

//obtener preguntas
app.get('/get-questions', (req, res) => {
  Question.find({})
    .then(questions => {
      res.status(200).json(questions);
    })
    .catch(err => {
      console.error(err);
      res.status(500).send(err);
    });
});

app.put('/update-question/:id/:option', (req, res) => {
  const id = parseInt(req.params.id);
  const option = req.params.option;

  if (isNaN(id)) {
    return res.status(400).send('Invalid id');
  }

  if (option !== 'option1' && option !== 'option2') {
    return res.status(400).send('Invalid option');
  }
  Question.findOne({ 'question': { $elemMatch: { id: id } } })
    .then(doc => {
      if (!doc) {
        return res.status(404).send('Question not found');
      }

      // Find the question in the question array
      const question = doc.question.find(q => q.id === id);

      if (option === 'option1') {
        question.opt1_times_clicked += 1;
      } else if (option === 'option2') {
        question.opt2_times_clicked += 1;
      }

      // Update the question in the database
      return Question.updateOne(
        { '_id': doc._id, 'question.id': id },
        { $set: { 'question.$': question } }
      );
    })
    .then(() => {
      res.status(200).send('Question updated successfully');
    })
    .catch(err => {
      console.error(err);
      res.status(500).send(err);
    });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});