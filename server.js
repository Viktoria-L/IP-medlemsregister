import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';

//Express setup
const port = 3000;
const app = express();
app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.urlencoded());
app.use(express.static('public'));


//MongoDB setup
const client = new MongoClient('mongodb://127.0.0.1:27017');
await client.connect();
const db = client.db('InnerPeaceDB');
const membersCollection = db.collection('members');


//------------- ROUTES --------------//
//Startsida
app.get('/', async (req, res) => {
    res.render('index', {title: 'Hem'})
});

//Visa alla medlemmar
app.get('/members', async (req, res) => {
    const members = await membersCollection.find({}).toArray();
    res.render('members', {title: 'Medlemslista', members})
});

//Visa medlem
app.get('/member/:id', async (req, res) => {
    const member = await membersCollection.findOne({ _id: new ObjectId(req.params.id) });
    const joinedDate = member.joined.toLocaleDateString();
    res.render('member', {
    title: 'Medlemssida',
    id: member._id,
    name: member.name,
    email: member.email,
    phone: member.phone,
    joined: joinedDate,
    experience: member.experience,
    });
   });

//Lägg till medlem
app.get('/members/add', (req, res) => {
    res.render('add-member', { title: 'Lägg till medlem'});
});

// ---------- POST ----------- //

//Lägga till medlem
app.post('/members/add', async (req, res) => {
    await membersCollection.insertOne({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        joined: new Date(req.body.joined),
        experience: req.body.experience,
      });
    res.redirect('/members');
});

//Uppdatera en medlem
app.post('/member/:id', async (req, res) => {    
    const memberId = new ObjectId(req.params.id);
    const joinedDate = new Date(req.body.joined); // konvertera datumet till Date-objekt
    console.log(joinedDate.toISOString());
    const update = { $set: {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        joined: new Date(joinedDate),
        experience: req.body.experience,
      }};
    await membersCollection.updateOne( {_id: memberId} , update);
    res.redirect('/members');
});

// ---------- SORT ------------- //
app.get('/members/ascending', async (req,res)=> {
    const members = await membersCollection.find({}).sort({name: 1}).collation({ locale: "en" }).toArray();
    res.render('members', {title: 'Medlemslista', members})
})
app.get('/members/descending', async (req,res)=> {
    const members = await membersCollection.find({}).sort({name: -1}).collation({ locale: "en" }).toArray();
    res.render('members', {title: 'Medlemslista', members})
})

//---------- DELETE ----------- //
app.post('/delete/:id', async (req, res) => {
    await membersCollection.deleteOne({ 
        _id: new ObjectId(req.params.id) 
    })
    res.redirect('/members')
})

app.listen(port, () => console.log(`Listening to port ${port}`));
