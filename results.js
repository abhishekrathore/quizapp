let notattempted = 0
let correct = 0
let wrong = 0

localforage.iterate(function(value, key, iterationNumber) {
        if (value.selected == -1) {
          notattempted += 1
        }
        if (value.selected == value.shouldbe) {
          correct += 1
        }
        else {
          wrong += 1
        }
}).then(function() {
  console.log(correct);
  console.log(wrong);
  console.log(notattempted);
  //$(".correct").html(correct)
  //$(".wrong").html(wrong)
  //$(".attempted").html(notattempted)
  //$(".total").html(correct*3)
  });
