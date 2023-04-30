const express = require('express')
const cors = require('cors')
const mysql = require('mysql')
const multer = require('multer')
const path = require('path')
const fs = require('fs');
const { parseArgs } = require('util')
const https = require('https');
var http = require('http');


var privateKey  = fs.readFileSync('./sslcert/privkey.pem', 'utf8');
var certificate = fs.readFileSync('./sslcert/cert.pem', 'utf8');

var credentials = {key: privateKey, cert: certificate};

const app = express()

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials , app);



var corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
  }
let uploadlocation = '';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './Uploads')
    }, 
    filename: (req, file, cb) => { 

        console.log(file)
        uploadlocation = Date.now() + path.extname(file.originalname)
        cb(null, uploadlocation)
    },
});

const upload = multer({storage: storage});


app.use(cors(corsOptions))
app.use(express.json())
app.use(express.static(path.join(__dirname, 'build')));


const db = mysql.createConnection({
    user: 'root',
    password: 'password',
    database: 'musicsystem',
}); 


app.get('/GetAllProfiles', (req, res) => {

    const id = req.query.ID; 
    console.log("User ", id, " Has requested a list of all users")

    db.query("SELECT * FROM musicpost WHERE id != ?", id ,(err,result) => {
        if(err)
        {
            console.log(err);
        } else {
            res.send(result);
        }
    })
})

app.get('/' , (req, res) => {
    res.sendFile(__dirname + '\\build\\index.html');
})

app.get('/GetProfile', (req, res) => { 

    const ID = req.query.id;
    console.log("Getting profile ", ID);

    db.query("SELECT * FROM musicpost WHERE id = ?;", [ID], (err,result) =>
    {
        if(err)
        {
            console.log(err);
        } else {
            res.send(result);
        }
    });
})

app.get('/SignIn', (req,res) => {

    const ID = req.query.id;
    const password = req.query.password;

    console.log("Someone is trying to sign in through ", ID);

    let Success = false;


    db.query("SELECT * FROM adminaccounts WHERE user = ?", ID , (err, response) => 
    {
        if(err)
        {
            console.log(err);
        } else 
        {
            console.log(response)

            const result = JSON.parse(JSON.stringify(response[0]));

            if(result !== null)
            {
                const pass = result.password;

                if(pass === password)
                {
                    Success = true;
                    console.log("Sign in sucessful from", ID);
    
    
                }
                else
                {
                    console.log("invalid password");
    
    
                } 
            }


            res.send({signedIn: Success})

        }})

})

app.get('/GetSong', (req, res) => {
    const fileName = req.query.audioId;
    const filepath = "./Uploads/" + fileName;
    const stat = fs.statSync(filepath);

    console.log(filepath);
    console.log(stat);

    const header = 'attachment; filename=' + fileName;

    res.sendFile(fileName , {root: './Uploads/'});

    
})

app.post('/AddPost', upload.single('audio'), (req, res) => {


    let IP = req.ip;

    console.log("resquest found");
    console.log(req.body.title); 
    console.log(req.body.poster); 
    console.log("Uploaded ", uploadlocation, "!");

    db.query("INSERT INTO musicpost (name,songName,genre,songFilePath,ipaddress) VALUES (?, ?, ?, ?, ?)", [req.body.poster, req.body.title, req.body.genre, uploadlocation, IP], (err, result) =>
    {
        if(err)
        {
            console.log(err);
        } else { res.send(result); console.log("Posted to DB");}
    })
    
    uploadlocation = ''
})

app.put('/Update', (req, res) => {
    db.query("UPDATE musicpost SET name = ?, genre = ?, songName = ? WHERE id = ?;", [req.body.name, req.body.genre, req.body.songName, req.body.ID], (err, result) => {
        if(err)
        {
            console.log(err);
        } else { res.send(result); console.log("Updated User!");}
    })
})

app.delete('/Delete', (req, res) => {

    const ID = req.query.ID;

    db.query("SELECT `songFilePath` FROM musicpost WHERE id = ?", ID, (err, result) => {
        if(err)
        {
            console.log(err)
        } else 
        {

            console.log(result[0].songFilePath);
            const fileName = result[0].songFilePath;
            const filepath = __dirname + "\\Uploads\\" + fileName;
            console.log(filepath);

            fs.unlinkSync(filepath, (delerr, delres) => 
            {
                if(delerr)
                {
                    console.log(delerr); 

                    throw delerr;

                } else {
                    console.log(fileName, " has been sucessfully deleted!");

                    db.query("DELETE FROM musicpost WHERE id = ?;", ID, (errremove, removeresult) => 
                    {
                        if(errremove)
                        {
                            console.log(errremove);
                            throw errremove;
                        } else { res.end(); console.log("Deleted User!");}
                    })
                } 
            } ); 


        }
        
    })




})

app.delete('/DeleteAll', (req, res) => {

    const filepath = __dirname + "\\Uploads\\";

    fs.readdir(filepath, (err, files) => {
        if (err) throw err;
      
        for (const file of files) {
          fs.unlink(path.join(filepath, file), (err) => {
            if (err) throw err;
          });
        }
    });

    db.query("TRUNCATE musicpost", (err, result) => 
    {
        if(err)
        {
            console.log(err)
            throw err;
        }
        else 
        {
            console.log("all users deleted")
            res.end()
        }
    })
})


httpServer.listen(888, "127.0.0.1");
httpsServer.listen(889, "127.0.0.1", () => {
    console.log("Server is running on port 3001")
} )