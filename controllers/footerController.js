module.exports.contact=async (req,res) =>{
    try{
        res.render("footers/contact.ejs");
    }catch(e){
        console.log("Error occurred: ",e);
    }
}


module.exports.privacy=async (req,res) =>{
    try{
        res.render("footers/privacy.ejs");
    }catch(e){
        console.log("Error occurred: ",e);
    }
}



module.exports.support=async (req,res) =>{
    try{
        res.render("footers/support.ejs");
    }catch(e){
        console.log("Error occurred: ",e);
    }
}







module.exports.terms=async (req,res) =>{
    try{
        res.render("footers/terms.ejs");
    }catch(e){
        console.log("Error occurred: ",e);
    }
}