const electron = require('electron')
// Module to control application life.
const {ipcMain} = require("electron")
const app = electron.app
const fs = require('fs');
var Converter = require("csvtojson").Converter;
var converter = new Converter({});

// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 1000, height: 780})

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/src/index.html`)


  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}


let testWindow

function createTestWindow () {
  // Create the browser window.
  testWindow = new BrowserWindow({width: 800, height: 600, fullscreen: true, frame: false})

  // and load the index.html of the app.
  testWindow.loadURL(`file://${__dirname}/src/quiz.html`)


  // Emitted when the window is closed.
  testWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    testWindow = null
  })
}


function uploadWindow (ev){
  const dialog = require('electron').dialog;
  var path = dialog.showOpenDialog({ properties: [ 'openFile', 'openDirectory' ]});
  converter.fromFile(path[0],function(err,result){
    ev.sender.send("json",result);
    console.log(result);
  });

}


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
ipcMain.on("test",() => {
  createTestWindow()
  mainWindow.close()
})

ipcMain.on("upload",(ev) => {
  uploadWindow(ev)
})
