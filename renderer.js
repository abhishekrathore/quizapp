// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const {ipcRenderer} = require('electron')
var _ = require("underscore");

//$(".start").on("click",(e) => {
//  e.preventDefault();
//  console.log("sahi hai");
//  ipcRenderer.send("test")
//})
//$(".upload-btn").click(() => {
//  ipcRenderer.send("upload")
//})
ipcRenderer.on("json",function(ev,data){
var processed =_.map(data,function(row){
  return {
    "q":row.q,
    "id":row.id,
    "o":[row.o1,row.o2,row.o3,row.o4],
    "shouldbe":row.shouldbe,
    "selected":row.selected
  }
})
  _.each(processed,function(row,i){

    localforage.setItem("q"+(i+1),row);

  })

  console.log(ev);
  console.log(data);

})