 // importer le module
 const cors = require('cors');
 const express = require('express');
 const app = express();
 const bodyParser = require('body-parser');
 const fs = require('fs');
 const fetch =require('node-fetch');
 const swaggerUi = require('swagger-ui-express');
 const swaggerDocument = require('./swagger.json');
 const DBASE = require("./DBASE.js");
 
 const PORT = process.env.PORT || 3000;
 const axios = require('axios').default;
  
  
app.use(bodyParser.json());
 app.get('/', (req,res) => {
      res.json({test : "Bienvenue a l'application des Logements Sociaux, aller sur /api-docs pour la documentation de notre api et nos differents roots"});
  })
  
  
 
  
 
  // serveur
  
    
    
    
    
    
    
  // POST /creer un nouveau user
 
 app.post("/api/user",(req,res)=>{
   var body = req.body;
 console.log("body", body);	
   const {region,avis}=req.body
   if(!region||!avis){//si l'utilisateur n'as pas renseigné toutes ces info
     res.status(400).json({error:"Merci de remplir les champs"})
     return
   }
   const user={region,avis}
   const sql= "INSERT INTO user(region,avis) VALUES(?,?)"
   const params= [user.region,user.avis]
   
   DBASE.run(sql,params,function(err,result){
	if(err) console.log("error", err);
	else res.send(user);
     });
	 
	 
	 
	 
     
     })
    
  
  
  
  
  
  
  
  // Afficher un user avec son id

app.get("/api/user/:id",(req,res)=>{
	const {id:userID}=req.params
	const sql= "SELECT * FROM user WHERE id= ?"
	const params=[userID]
	DBASE.get(sql,params,(err,row)=>{
		if(err){
			res.status(400).json({error:err.message})
			return
		}
				
		res.json({message:`Afficher l'avis de l'utilisateur ${userID} sur la région`,data:row})
		
	})
		
})



    
  // Afficher les avis d'une région

app.get("/api/:region",(req,res)=>{
	const {region:userR}=req.params
	const sql= "SELECT avis FROM user WHERE region = ?"
	//console.log(sql);
	const params=[userR]
	DBASE.all(sql,params,(err,row)=>{
		if(err){
			res.status(400).json({error:err.message})
			return
		}
		//console.log("longueur",row.length)
		res.json({message:`Afficher les avis sur la région de ${userR} `,data:row})
		
	})
		
})
  
  
  
  
  
  
 // Afficher les régions qui ont un avis donné

app.get("/api/avis/:avis",(req,res)=>{
	const {avis:userA}=req.params
	const sql= "SELECT DISTINCT(region) FROM user WHERE avis = ?"
	//console.log(sql);
	const params=[userA]
	DBASE.all(sql,params,(err,row)=>{
		if(err){
			res.status(400).json({error:err.message})
			return
		}
		//console.log("longueur",row.length)
		res.json({message:`Afficher les regions qui ont un avis: ${userA} `,data:row})
		
	})
		
}) 
 app.use('/api-docs',swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    
  
// deuxieme partie avec le fonctionnement du site web
const corsOption = {
    origins: 'localhost',
    credentials: 'include'
}

app.use(cors(corsOption));

 app.use(bodyParser.json());
 app.use(bodyParser.urlencoded({extended : true}));




var data = fs.readFileSync('data.json');
var myObject= JSON.parse(data);


function saveData(nom,email,message){
  console.log(nom,email,message);
  let newData = {
  nom : nom,
  email : email,
  message: message
  };
  myObject.push(newData);
var newData2 = JSON.stringify(myObject);
fs.writeFile('data.json', newData2, err => {
    // error checking
    if(err) throw err;
    
    console.log("New data added");
});

}
 // Post

 app.post("/savecontact",function(req,res){
  

  saveData(req.body.nom,req.body.email,req.body.message);
  return res.json({
          data: "moi le client je recois bien les informations"
      });
  /*
  // curl -d '{"nom":"value1", "email":"value2","message":"salue"}' -H "Content-Type: application/json" -X POST 127.0.0.1:3000/savecontact
  let newNote = new Note({
  nom : req.bodyParser.nom,
  e_mail : req.bodyParser.email,
  message: req.bodyParser.message
  });
  newNote.save();
  */

 })



//app.use(express.static('resources/public'));


app.post('/',(req,res)=>{
 console.log(req.body) // the data we gets is in the body of request

})
 
 // Fournir toutes les informations 
 
 app.get('/Logement', function(request, response){
 
   fetch("https://opendata.caissedesdepots.fr/api/records/1.0/search/?dataset=constructionrehabilitation_logementsocial_surface_prix&q=&rows=18&facet=code_region&facet=region&facet=annee_financement")
       .then(res => res.json())
       .then(json => {

        var region = {};

         var construction = [];
         
         for (let i = 0; i< json.records.length;i++){

          construction.push({

          nom_region: json.records[i].fields.region,
          rehabilitation_prix_derevient_m2:json.records[i].fields.rehabilitation_prixderevient_m2,
          construction_prixderevient_m2: json.records[i].fields.construction_prixderevient_m2,
          rehabilitation_prixderevient_logement: json.records[i].fields.rehabilitation_prixderevient_logement,
          construction_surface_moy_m2_su: json.records[i].fields.construction_surface_moy_m2_su,
          annee_financement: json.records[i].fields.annee_financement,
          rehabilitation_surface_moy_m2_su: json.records[i].fields.rehabilitation_surface_moy_m2_su,
          construction_prixderevient_logement: json.records[i].fields.construction_prixderevient_logement

          });
           
         }
        
         response.json(construction);
 
       }); 
 
 })

 // Obtenir la surface moyenne de chaque logement 

  app.get('/surface', function(request, response){
 
   fetch("https://opendata.caissedesdepots.fr/api/records/1.0/search/?dataset=constructionrehabilitation_logementsocial_surface_prix&q=&rows=18&facet=code_region&facet=region&facet=annee_financement")
       .then(res => res.json())
       .then(json => {
        var region = {};
         var construction = [];
         for (let i = 0; i< json.records.length;i++){
          construction.push({
          nom_region: json.records[i].fields.region,
          construction_surface_moy_m2_su: json.records[i].fields.construction_surface_moy_m2_su,
          rehabilitation_surface_moy_m2_su: json.records[i].fields.rehabilitation_surface_moy_m2_su,
          });
         }
         response.json(construction);
 
       }); 
 
 })

 // // prix revient de chaque logement 

app.get('/prixderevient_logement', function(request, response){
 
   fetch("https://opendata.caissedesdepots.fr/api/records/1.0/search/?dataset=constructionrehabilitation_logementsocial_surface_prix&q=&rows=18&facet=code_region&facet=region&facet=annee_financement")
       .then(res => res.json())
       .then(json => {

        var region = {};

         var construction = [];
     
         for (let i = 0; i< json.records.length;i++){

          construction.push({
          nom_region: json.records[i].fields.region,
          rehabilitation_prixderevient_logement: json.records[i].fields.rehabilitation_prixderevient_logement,
          construction_prixderevient_logement: json.records[i].fields.construction_prixderevient_logement
          }); 
         }
         response.json(construction);
 
       }); 
 
 })


 app.get('/prix_revient', function(request, response){
 
   fetch("https://opendata.caissedesdepots.fr/api/records/1.0/search/?dataset=constructionrehabilitation_logementsocial_surface_prix&q=&rows=18&facet=code_region&facet=region&facet=annee_financement")
       .then(res => res.json())
       .then(json => {

        var region = {};

         var construction = [];
     
         for (let i = 0; i< json.records.length;i++){

          construction.push({

          nom_region: json.records[i].fields.region,
          rehabilitation_prix_derevient_m2:json.records[i].fields.rehabilitation_prixderevient_m2,
          construction_prixderevient_m2: json.records[i].fields.construction_prixderevient_m2,

          });
           
         }
        
         response.json(construction);
 
       }); 
 
 })

 // fournir le prix de revient du logement
 
 // Fournir l'ensemble toutes les informations d'une regions
 
 app.get('/Logement/:region', function(request, response){
 
   const code = request.params.region;
 
   
   fetch("https://opendata.caissedesdepots.fr/api/records/1.0/search/?dataset=constructionrehabilitation_logementsocial_surface_prix&q=&rows=18&facet=code_region&facet=region&facet=annee_financement")
       .then(res => res.json())
       .then(json => { 
         var construction = [];
         
         
         for (let i = 0; i< json.records.length;i++){
 
           if (json.records[i].fields.region === code ){
 
           construction.push({
             rehabilitation_prixderevient_m2:json.records[i].fields.rehabilitation_prixderevient_m2,
             construction_prixderevient_m2: json.records[i].fields.construction_prixderevient_m2,
             rehabilitation_prixderevient_logement: json.records[i].fields.rehabilitation_prixderevient_logement,
             construction_surface_moy_m2_su: json.records[i].fields.construction_surface_moy_m2_su,
             annee_financement: json.records[i].fields.annee_financement,
             rehabilitation_surface_moy_m2_su: json.records[i].fields.rehabilitation_surface_moy_m2_su,
             construction_prixderevient_logement: json.records[i].fields.construction_prixderevient_logement
           });
 
         }
           
         }
        
         response.json(construction);
 
       }); 
 
 })
 
 
 
 // la region ayant le prix de rehabilitation maximale au m2
 
 app.get('/Prix_max', function(request, response){
 
   const code = request.params.region;
 
   fetch("https://opendata.caissedesdepots.fr/api/records/1.0/search/?dataset=constructionrehabilitation_logementsocial_surface_prix&q=&rows=18&facet=code_region&facet=region&facet=annee_financement")
       .then(res => res.json())
       .then(json => { 
        var construction = [];
        var  j =0;
            max = json.records[0].fields.rehabilitation_prixderevient_m2;
         for (let i = 1; i< json.records.length;i++){
               valeur = json.records[i].fields.rehabilitation_prixderevient_m2;
               if(valeur > max){
                 max = valeur;
                 j = i;
              }
           
         }

        construction.push({
        region:json.records[j].fields.region,
        annee_financement: json.records[j].fields.annee_financement,
        rehabilitation_prixderevient_m2_max:json.records[j].fields.rehabilitation_prixderevient_m2,
        construction_prixderevient_m2:json.records[j].fields.construction_prixderevient_m2,
        
           });
        
         response.json(construction);
 
       }); 
 
 })
 

 // serveur
 
 
 // 2eme fichier 
 app.get('/nombre_logement', function(request, response){
   
       fetch("https://opendata.caissedesdepots.fr/api/records/1.0/search/?dataset=bailleurs_sociaux_dep&q=&rows=15&facet=region&exclude.annee=2017")
           .then(res => res.json())
           .then(json => { 
             var arret = [];
             console.log(json.records.length)
             for (let i = 0; i< json.records.length;i++){
               arret.push({
                 nom_region:json.records[i].fields.region,
                         libelle_departement:json.records[i].fields.libelle_departement,
                 nbre_logements_re: json.records[i].fields.nbre_logements
               });
             }
             response.json(arret);
   
           });
           
   
   })

 // Api groupe 
 app.get('/ville/:nom_ville', function(request, response){
      const ville = request.params.nom_ville;   

       fetch(`https://villeeco.osc-fr1.scalingo.io/ville-eco/${ville}`)
       //fetch("https://villeeco.osc-fr1.scalingo.io/ville-eco/Montpellier")
           .then(res => res.json())
           .then(json => { 
            response.json(json);
            //console.log(ville);
           });
           
   })


 
   
   
 app.listen(PORT,()=>{
     console.log('serveur en marche ');
 })



  