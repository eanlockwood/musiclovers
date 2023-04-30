# musiclovers
Full stack app with NGINX reverse proxy configuration, source code for your viewing pleasures as an example for deploying a fullstack react application (- the ssl certificates and domain name of course)


# Known issues with site:

## 1. Utelizing the admin pannel to delete a single user causes server to crash if they attempt to delete their profile in the client after deletion in backend

This is because there isnt check in place to to update the local storage of what ID the browser is attached too, so after deletion the browser still thinks its user X when user X doesnt actually exist anymore. Working on fix in free time, but since I am the only admin, there wont be any server side deletions made anytime soon

## 2. There are no multer side checks that verify the uploaded file type is an mp3 or wav file (as well as file size limits)

Not really too big of a deal as the audio player simply wont output anything, this is just a portfolio project afterall but I am working on a solution as we speak just for aditional security reasons and for fun


## 3. Despite being https, the site is still "unsecure" 

This is my first time working with ssl certificates so I am looking into this, I might have simply configured the self signed certs wrong in certbot (also looking back at the express server it seems like I setup the https module wrong) 

## 4. console output for starting the server says "Running on port '3001'" despite not actually doing so

Oops, Ill change that in the future as well as setting up a .env file for modularity. Totally slipped my mind

## 5. Accessing the website outside of the home page does not work 

Issue with the react router and HTML serving, either in the express server or NGINX I need to make a route to be able to serve /View/, this could be a challenge since react doesnt output static pages other than "index.js" to my knowledge


# How to get Site running on local machine

So you want to run this on your local host to get a feel for how file uploading is done? You've come to ** a ** place to see a barebones output of such a thing!

## prerequisites

1. Have NodeJS installed, VS Code, and MySQL (preferably with workbench as it makes modifying the database signifigantly easier)

## Steps to set up on local host 

1. Create a database in mysql named "musicsystem", and import the files in the "MySQL Dumps" folder (signifigantly easier in workbench) 
2. Inside of the index.js in the server folder, look for the declaration of db and change the password and username to fit your mysql enviroment needs
3. (Optional) If there are mysql related errors, make sure to flush the permissions of your root user (or whatever enviroment you setup in the index.js file) 
4. Inside of the react folder, go through the components and with every link you see to musiclovers.studio, replace with http://localhost:888 (and of course keep the extended path like '/GetProfile')
5. unless you know how to make SSL certificates, inside of the server index.js, delete or comment out the lines 12 and 263-265, this will disable https and save you plenty of headaches

Now there are 2 ways of going about serving the HTML from react 

## Running React seperate from the server

In this instance You'll be running the server seperate from react, this option is best if you want to play around with the html :) 

1. Have a terminal opened in cd [Path to files]/Server and run "node index.js" (this will start the server, to stop the server hit ctrl + c, Note: to make changes to the server you must always stop and restart the server afterwards)
2. Likewise, inside [Path to files]/Desktop-Client/musiclovers run "npm start"

Now you have both the server and react app serving seperatley for easier editing! To visit the page, simple open a browser and go to localhost:3000! 

## Running everything from the server 

Perhaps you want to expiriment with just the server side of things, see it from a birds eye perspective as an example, you can do that too! 

1. CD into [Path to files]/Desktop-Client/musiclovers and run "npm run build" | This will essentially "Build" the project like a game engine! 

opening to the folder through a file explorer will show that there is a folder labeled "Build" inside the path
This Folder has been there from my previous build, but just note that running "npm run build" will generate this folder if there hasnt been one already or will update it to the current build

2. copy this folder and cd into the server folder 

3. Paste the folder into the server directory and and run the command "node index.js" to start the server 

4. To visit the site, visit localhost:888/ and the site should display as normal, thats because the route 'GET /' is servering the index.html from the build folder you just pasted 


Note to make changes to the HTML file you have to rebuild the project and paste the folder into the server folder again, but this time you dont have to restart the server because all you're doing is retrieving a file from the build folder and sending it to the browser, technically if you wanted you could inject any HTML page in the build folder and it will serve so long as its called "index.js" !


# Conclusion 

Thank you for looking over my repository! If you wish to deploy this site for expirimental purposes go right ahead! Ive supplied the NGINX configuration file so you dont have to make your own, for expirimenting with Domain Names, SSL certifications ect, youll have to research on your own but the site structure is all here :) 

[P.s Dont forget to update the get requests in the react app if you're aiming for deployment! change the "http://localhost:888" to "http://mydomain/" (the http is important because if you dont put it there the app will attempt to connect to localhost/mydomain"] 
