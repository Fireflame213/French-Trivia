const SERVER_URL = "/";
var question, hash, length;
var currentRow = -1;
var input = "";

function updateCellClasses(cellClasses, correct) {
    let row = $("#tiles tr").eq(currentRow);
    let cells = row.children();
    let animation = correct ? "jump" : "animate";  // Different animations for correct/wrong answer.
    for (let i = 0; i < length; ++i) {
        setTimeout(function() {
            cells.eq(i).removeClass();  // Reset the style (cell background colour).
            cells.eq(i).addClass(animation);  // Animate the cell.
            if (cellClasses[i] === undefined) {
                cells.eq(i).addClass("cell-incorrect");
            } else {
                cells.eq(i).addClass(cellClasses[i]);
            }
            setTimeout(function() {
                cells.eq(i).removeClass(animation);  // Stop the correct/wrong answer animation.
            }, 500);
        }, 300);
    }
}

function displayWinMessage() {
    let message = "Tu as gagne ";
    if (currentRow == 0) {
        message += "la premiere fois!";
    } else {
        message += `in ${currentRow + 1} essaies!`;
    }
    message += `<br><br>Rechargez la page pour rejouer`;
    setTimeout(function() {
        $("#center-box").addClass("content").html(message);
    }, 1000);  // Display the message box after 1s.
}

function checkGuess(hash, guess) {
    console.log("Checking guess", hash, guess);
    var result;
    $.ajax({
        url: SERVER_URL + "check",
        type: "POST",
        crossDomain: true,
        async: false,
        data: JSON.stringify({hash: hash, event: guess}),
        contentType: "application/json",
        dataType: "json",
        success: function(data) {
            result = data;
        }
    });
    let correct = result.correct;
    let correct_indexes = result.correct_indexes;
    let wrong_places = result.wrong_places;
    let cellClasses = [...Array(length)];  // Create an empty array.
    for (let i = 0; i < correct_indexes.length; ++i) {
        cellClasses[correct_indexes[i]] = "cell-correct";
    }
    for (let i = 0; i < wrong_places.length; ++i) {
        cellClasses[wrong_places[i][0]] = "cell-wrong-place";
    }
    // If cellClasses[i] is undefined, then its style is cell-incorrect.
    updateCellClasses(cellClasses, correct);
    if (correct) {
        displayWinMessage();
    }
    return correct;
}

function addRow() {
    let table = $("#tiles");
    let cell = $("<td></td>").addClass("cell-blank").text(" ");  // Create a blank cell.
    let row = $("<tr></tr>");
    for (let i = 0; i < length; ++i) {
        row.append(cell.clone());  // Add each cell to the row.
    }
    table.append(row);  // Add the new row to the table.
    ++currentRow;
}

function updateInput() {
    console.log("Updating input", input);
    let row = $("#tiles tr").eq(currentRow);
    let cells = row.children();
    for (let i = 0; i < input.length; ++i) {
        cells.eq(i).text(input[i]);  // Set the cell to be the input char.
    }
    for (let i = input.length; i < length; ++i) {
        cells.eq(i).text(" ");  // The rest of them are empty.
    }
}

$(document).ready(function() {
    console.log("ready!");

    // Get the question, hash, and length from the server.
    $.ajax({
        url: SERVER_URL + "get_event",
        type: "GET",
        crossDomain: true,
        async: false,
        dataType: "json",
        success: function(data) {
            question = data.question;
            hash = data.hash;
            length = data.length;
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(textStatus, errorThrown);
        }
    });

    console.log(question, hash, length);

    $("#question").text(`question: ${question}`);  // Display the question for the event.
    addRow(); // Add the first row.

    // Watch for the keydown events.
    document.addEventListener("keydown", function(event) {
        const key = event.key;
        if (key === "Backspace" || key === "Delete") {
            input = input.slice(0, -1);  // Delete the last char.
        } else if (key === "Enter") {
            if (input.length === length) {  // Make sure all the cells are filled.
                if (!checkGuess(hash, input)) {
                    input = "";  // Reset the input.
                    addRow();  // Create a new row.
                }
            }
        } else {
            // Make sure the input doesn't exceed the length of the event and also
            // make sure that the input is a char, not another type of key (ctrl, etc.).
            if (input.length < length && key.length === 1) {
                input += key.toLowerCase();
                input = input.slice(0, length);  // If it exceeds the length, cut it.
            }
        }
        updateInput();  // Update the input displayed on screen.
    });
});
