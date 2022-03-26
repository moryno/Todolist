//jshint esversion: 6

const express = require("express");
const ejs = require("ejs");
const app = express();
const mongoose = require("mongoose");
const _ = require("lodash");

app.use(express.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine", "ejs");
//1. connect to mongoDB
mongoose.connect("****");
//2. create a new Schema
const itemsSchema = {
    name: {
        type: String,
        required: true
    }
}
//3. create a model
const Item = mongoose.model("Item", itemsSchema);
//4. create a new documents and save in a default array
const item1 = new Item({
    name: "Welcome to your todolist."
})
const item2 = new Item({
    name: "Hit the + button to add a new item."
})
const item3 = new Item({
    name: "Check the box to delete an item."
})
const defaultItems = [item1, item2, item3];

//10. create new schema for custom list
const listSchema = {
    name: String,
    items: [itemsSchema]
}
//11. create custom list model
List = mongoose.model("List", listSchema)

app.get("/", function(req, res){
    //6.rendering database items in the toDoList app
    Item.find({}, function(err, foundItems){
        if(!err){
           if(foundItems.length === 0){
               //5. add the array of documents to database
                Item.insertMany(defaultItems, function(err){
                    if(!err){
                        console.log("success");
                    }
  
                })
                res.redirect("/");
            }
            else{
                res.render("list", {listTitle: "Today", newListItems: foundItems});
            }
        }
    })
    
    
})

//9. create custom list using express route parameters.
app.get("/:customAddress", function(req, res){
    const customAddressName = _.capitalize(req.params.customAddress);

    
    List.findOne({name: customAddressName}, function(err, foundList){
        if(!err){
            if(!foundList){
                //12.add items to custom list
                const list = new List({
                    name: customAddressName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/" + customAddressName);
            }
            else{
                res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
                
            }
        }
    })
})

app.post("/", function(req, res){
    const itemName = req.body.newItem;
    const listName =  req.body.list;
    //7. create new item to the toDoList DB.
    const item = new Item({
        name: itemName
    });
  
   if(listName === "Today"){
       item.save();
       res.redirect("/");
   }
//13. add item to the custom list
   else{
       List.findOne({name: listName}, function(err, foundItem){
           if(!err){
               foundItem.items.push(item);
               foundItem.save();
               res.redirect("/" + listName);
           }
       })
   }
   

})
//8.delete an item when checkbox is checked.
app.post("/delete", function(req, res){
    checkedId = req.body.checkbox;
    checkedListName = req.body.listName;
if(checkedListName === "Today"){
    Item.findByIdAndRemove({_id: checkedId}, function(err){
        if(!err){
            res.redirect("/");
        }
    })
}
//14. delete from a custom list
else{
    List.findOneAndUpdate({name: checkedListName}, {$pull:{items:{_id: checkedId}}}, function(err, foundList){
        if(!err){
            res.redirect("/" + checkedListName);
        }
    })
}

    
})


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


app.listen(port, function(){
    console.log("Server is running");
})
